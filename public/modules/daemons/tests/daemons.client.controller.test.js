'use strict';

(function() {
	// Daemons Controller Spec
	describe('DaemonsController', function() {
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
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
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
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
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

		it('$scope.find() should create an array with at least one daemon object fetched from XHR', inject(function(Daemons) {
			// Create sample daemon using the Daemons service
			var sampleDaemon = new Daemons({
				title: 'An Daemon about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample daemons array that includes the new daemon
			var sampleDaemons = [sampleDaemon];

			// Set GET response
			$httpBackend.expectGET('daemons').respond(sampleDaemons);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.daemons).toEqualData(sampleDaemons);
		}));

		it('$scope.findOne() should create an array with one daemon object fetched from XHR using a daemonId URL parameter', inject(function(Daemons) {
			// Define a sample daemon object
			var sampleDaemon = new Daemons({
				title: 'An Daemon about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.daemonId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/daemons\/([0-9a-fA-F]{24})$/).respond(sampleDaemon);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.daemon).toEqualData(sampleDaemon);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Daemons) {
			// Create a sample daemon object
			var sampleDaemonPostData = new Daemons({
				title: 'An Daemon about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample daemon response
			var sampleDaemonResponse = new Daemons({
				_id: '525cf20451979dea2c000001',
				title: 'An Daemon about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Daemon about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('daemons', sampleDaemonPostData).respond(sampleDaemonResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the daemon was created
			expect($location.path()).toBe('/daemons/' + sampleDaemonResponse._id);
		}));

		it('$scope.update() should update a valid daemon', inject(function(Daemons) {
			// Define a sample daemon put data
			var sampleDaemonPutData = new Daemons({
				_id: '525cf20451979dea2c000001',
				title: 'An Daemon about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock daemon in scope
			scope.daemon = sampleDaemonPutData;

			// Set PUT response
			$httpBackend.expectPUT(/daemons\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/daemons/' + sampleDaemonPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid daemonId and remove the daemon from the scope', inject(function(Daemons) {
			// Create new daemon object
			var sampleDaemon = new Daemons({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new daemons array and include the daemon
			scope.daemons = [sampleDaemon];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/daemons\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleDaemon);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.daemons.length).toBe(0);
		}));
	});
}());