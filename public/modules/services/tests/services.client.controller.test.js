'use strict';

(function() {
	// Services Controller Spec
	describe('ServicesController', function() {
		// Initialize global variables
		var ServicesController,
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

			// Initialize the Services controller.
			ServicesController = $controller('ServicesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one service object fetched from XHR', inject(function(Services) {
			// Create sample service using the Services service
			var sampleService = new Services({
				title: 'An Service about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample services array that includes the new service
			var sampleServices = [sampleService];

			// Set GET response
			$httpBackend.expectGET('services').respond(sampleServices);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.services).toEqualData(sampleServices);
		}));

		it('$scope.findOne() should create an array with one service object fetched from XHR using a serviceId URL parameter', inject(function(Services) {
			// Define a sample service object
			var sampleService = new Services({
				title: 'An Service about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.serviceId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/services\/([0-9a-fA-F]{24})$/).respond(sampleService);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.service).toEqualData(sampleService);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Services) {
			// Create a sample service object
			var sampleServicePostData = new Services({
				title: 'An Service about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample service response
			var sampleServiceResponse = new Services({
				_id: '525cf20451979dea2c000001',
				title: 'An Service about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Service about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('services', sampleServicePostData).respond(sampleServiceResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the service was created
			expect($location.path()).toBe('/services/' + sampleServiceResponse._id);
		}));

		it('$scope.update() should update a valid service', inject(function(Services) {
			// Define a sample service put data
			var sampleServicePutData = new Services({
				_id: '525cf20451979dea2c000001',
				title: 'An Service about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock service in scope
			scope.service = sampleServicePutData;

			// Set PUT response
			$httpBackend.expectPUT(/services\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/services/' + sampleServicePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid serviceId and remove the service from the scope', inject(function(Services) {
			// Create new service object
			var sampleService = new Services({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new services array and include the service
			scope.services = [sampleService];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/services\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleService);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.services.length).toBe(0);
		}));
	});
}());