'use strict';

angular.module('groups').controller('GroupsMonitoringController', ['$rootScope', '$scope', 'Socket',
    function ($rootScope, $scope, Socket) {

        var kb = 1024;
        var mb = 1024 * kb;
        var gb = 1024 * mb;
        var tb = 1024 * gb;

        $scope.stats = [];
        $scope.volumesDiskUsage = [];

        $scope.cpu = {};
        $scope.cpu.labels = [];
        $scope.cpu.series = ['CPU Usage'];
        $scope.cpu.data = [[]];
        $scope.cpu.options = {
            animation: false,
            showTooltips: false,
            scaleLabel: "<%=value%> %",
            scaleShowVerticalLines: false,
            pointDot : false
        };

        $scope.memory = {};
        $scope.memory.labels = [];
        $scope.memory.series = ['Memory Usage'];
        $scope.memory.data = [[]];
        $scope.memory.options = {
            animation: false,
            showTooltips: false,
            scaleLabel: "<%=value%> MB",
            scaleShowVerticalLines: false,
            pointDot : false
        };

        $scope.network = {};
        $scope.network.labels = [];
        $scope.network.series = ['RX Bytes, TX Bytes'];
        $scope.network.data = [[], []];
        $scope.network.options = {
            animation: false,
            showTooltips: false,
            scaleLabel: "<%=value%> KiB",
            scaleShowVerticalLines: false,
            pointDot : false
        };

        Socket.on('container.stat.start', function () {
            console.log('Starting docker stat long-polling');
        });

        Socket.on('container.stat.data', function (data) {
            $scope.stats.push(data);
            if ($scope.stats.length > 1) {
                var p = $scope.cpuPercent();
                $scope.cpu.data[0].push(p);
                $scope.cpu.labels.push('');

                var m = $scope.memoryUsage();
                $scope.memory.data[0].push(m);
                $scope.memory.labels.push('');

                var n = $scope.networkUsage();
                $scope.network.data[0].push(n.rx_bytes);
                $scope.network.data[1].push(n.tx_bytes);
                $scope.network.labels.push('');
            }
        });

        Socket.on('container.stat.error', function (message) {
            console.log(message);
        });

        Socket.on('container.stat.stop', function () {
            console.log('Stop docker stat long-polling');
        });

        Socket.on('container.stat.timeout', function () {
            console.log('Timeout of docker stat long-polling');
        });

        $scope.cpuPercent = function () {
            var p = 0;
            var myStat = $scope.stats[$scope.stats.length - 1];
            var prevStat = $scope.stats[$scope.stats.length - 2];
            var cpudelta = myStat.cpu_stats.cpu_usage.total_usage - prevStat.cpu_stats.cpu_usage.total_usage;
            var sysdelta = myStat.cpu_stats.system_cpu_usage - prevStat.cpu_stats.system_cpu_usage;
            if (sysdelta > 0.0 && cpudelta > 0) {
                p = (cpudelta / sysdelta) * myStat.cpu_stats.cpu_usage.percpu_usage.length * 100.0
            }
            return p;
        };

        $scope.memoryUsage = function () {
            var myStat = $scope.stats[$scope.stats.length - 1];
            var memused = myStat.memory_stats.usage;
            return memused / mb;
        };

        $scope.networkUsage = function () {
            var myStat = $scope.stats[$scope.stats.length - 1];
            var rx_bytes = myStat.network.rx_bytes;
            var tx_bytes = myStat.network.tx_bytes;
            return {rx_bytes : rx_bytes / kb, tx_bytes : tx_bytes / kb};
        };

        $scope.computeVolumesDiskUsage = function (volumesDiskUsage) {
            $scope.volumesDiskUsage = [];
            volumesDiskUsage.forEach(function (volumeUsage) {
                var volume = {};
                volume.name = volumeUsage.volume;
                volume.data = [];
                volume.labels = [];
                volumeUsage.stat.forEach(function(stat) {
                    if (stat.volume !== volumeUsage.volume) {
                        if (stat.volume) {
                            volume.data.push(stat.diskusage);
                            volume.labels.push(stat.volume);
                        }
                    } else {
                        volume.total = stat.diskusage;
                    }
                });
                $scope.volumesDiskUsage.push(volume);
            });
        };

        Socket.on('container.stat.volumesDiskUsage', function(volumesDiskUsage) {
            $scope.computeVolumesDiskUsage(volumesDiskUsage);
        });

    }
]);
