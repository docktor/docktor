'use strict';

(function () {
    // Daemons Controller Spec
    describe('DaemonsController', function () {
        // Initialize global variables
        var DaemonsController,
            scope,
            $httpBackend,
            $stateParams,
            $location;

        // The $resource service augments the response object with methods for updating and deleting the resource.
        // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
        // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
        // When the toEqualData matcher compares two objects, it takes only object properties into
        // account and ignores methods.
        beforeEach(function () {
            jasmine.addMatchers({
                toEqualData: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });

        // Then we can start by loading the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service but then attach it to a variable
        // with the same name as the service.
        beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
            // Set a new global scope
            scope = $rootScope.$new();

            // Point global variables to injected services
            $stateParams = _$stateParams_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;

            // Initialize the Daemons controller.
            DaemonsController = $controller('DaemonsController', {
                $scope: scope
            });
        }));

        it('$scope.find() should create an array with at least one daemon object fetched from XHR', inject(function (Daemons) {
            // Create sample daemon using the Daemons service
            var sampleDaemon = new Daemons({
                _id: '525a8422f6d0f87f0e407a33',
                name: 'An Daemon about MEAN',
                content: 'MEAN rocks!',
                site: {},
                cadvisorApi: '',
                cadvisorUrl: '',
                dockerStatus: 'down',
                dockerInfo: undefined,
                dockerVersion: undefined,
                machineInfo: undefined,
                statsCompute: {}
            });

            // Create a sample daemons array that includes the new daemon
            var sampleDaemons = [sampleDaemon];

            // Set GET calls and responses
            $httpBackend.expectGET('sites').respond();
            $httpBackend.expectGET('daemons').respond(sampleDaemons);
            $httpBackend.expectGET(/daemons\/docker\/infos\/([0-9a-fA-F]{24})$/).respond({});

            // Run controller functionality
            scope.find();
            $httpBackend.flush();

            // Test scope value
            expect(scope.daemons).toEqualData(sampleDaemons);
        }));

        it('$scope.findOne() should create an array with one daemon object fetched from XHR using a daemonId URL parameter', inject(function (Daemons) {
            // Define a sample daemon object
            var sampleDaemon = new Daemons({
                _id: '525a8422f6d0f87f0e407a33',
                name: 'An Daemon about MEAN',
                content: 'MEAN rocks!',
                site: {},
                cadvisorApi: '',
                cadvisorUrl: '',
                dockerStatus: 'down',
                dockerInfo: undefined,
                dockerVersion: undefined,
                machineInfo: undefined,
                statsCompute: {},
                selectSite: {}
            });

            // Set the URL parameter
            $stateParams.daemonId = '525a8422f6d0f87f0e407a33';

            // Set GET calls and responses
            $httpBackend.expectGET('sites').respond();
            $httpBackend.expectGET(/daemons\/([0-9a-fA-F]{24})$/).respond(sampleDaemon);
            $httpBackend.expectGET(/daemons\/docker\/infos\/([0-9a-fA-F]{24})$/).respond({});

            // Run controller functionality
            scope.findOne();
            $httpBackend.flush();

            // Test scope value
            expect(scope.daemon).toEqualData(sampleDaemon);
        }));

        it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function (Daemons) {
            // Create a sample daemon object
            var sampleDaemonPostData = new Daemons({
                name: 'An Daemon about MEAN',
                content: 'MEAN rocks!',
                selectSite: {}
            });

            // Create a sample daemon response
            var sampleDaemonResponse = new Daemons({
                _id: '525cf20451979dea2c000001',
                namw: 'An Daemon about MEAN',
                content: 'MEAN rocks!'
            });

            scope.daemon = sampleDaemonPostData;

            // Set GET call to /sites
            $httpBackend.expectGET('sites').respond();
            // Set POST response
            $httpBackend.expectPOST('daemons', sampleDaemonPostData).respond(sampleDaemonResponse);

            // Run controller functionality
            scope.create();
            $httpBackend.flush();

            // Test URL redirection after the daemon was created
            expect($location.path()).toBe('/admin/daemons/edit/' + sampleDaemonResponse._id);
        }));

        it('$scope.update() should update a valid daemon', inject(function (Daemons) {
            // Define a sample daemon put data
            var sampleDaemonPutData = new Daemons({
                _id: '525cf20451979dea2c000001',
                name: 'An Daemon about MEAN',
                content: 'MEAN Rocks!',
                selectSite: {
                  _id: '525a8422f6d0f87f0e407a33'
                }
            });

            // Mock daemon in scope
            scope.daemon = sampleDaemonPutData;

            // Set GET call to /sites
            $httpBackend.expectGET('sites').respond();
            // Set PUT response
            $httpBackend.expectPUT(/daemons\/([0-9a-fA-F]{24})$/).respond();

            // Run controller functionality
            scope.update(true);
            $httpBackend.flush();

            // Test URL location to new object
            expect($location.path()).toBe('/admin/daemons/view/' + sampleDaemonPutData._id);
        }));

        it('$scope.remove() should send a DELETE request with a valid daemonId and redirect to daemon list', inject(function (Daemons) {
            // Create new daemon object
            var sampleDaemon = new Daemons({
                _id: '525a8422f6d0f87f0e407a33'
            });

            // Create new daemons array and include the daemon
            scope.daemons = [sampleDaemon];

            // Set GET call to /sites
            $httpBackend.expectGET('sites').respond();
            // Set expected DELETE response
            $httpBackend.expectDELETE(/daemons\/([0-9a-fA-F]{24})$/).respond(204);

            // Run controller functionality
            scope.remove(sampleDaemon);
            $httpBackend.flush();

            // Test URL location to daemon list
            expect($location.path()).toBe('/admin/daemons');
        }));
    });
}());
