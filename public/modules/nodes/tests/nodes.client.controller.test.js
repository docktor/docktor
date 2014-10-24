'use strict';

(function() {
	// Nodes Controller Spec
	describe('NodesController', function() {
		// Initialize global variables
		var NodesController,
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

			// Initialize the Nodes controller.
			NodesController = $controller('NodesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one node object fetched from XHR', inject(function(Nodes) {
			// Create sample node using the Nodes service
			var sampleNode = new Nodes({
				title: 'An Node about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample nodes array that includes the new node
			var sampleNodes = [sampleNode];

			// Set GET response
			$httpBackend.expectGET('nodes').respond(sampleNodes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.nodes).toEqualData(sampleNodes);
		}));

		it('$scope.findOne() should create an array with one node object fetched from XHR using a nodeId URL parameter', inject(function(Nodes) {
			// Define a sample node object
			var sampleNode = new Nodes({
				title: 'An Node about MEAN',
				content: 'MEAN rocks!'
			});

			// Set the URL parameter
			$stateParams.nodeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/nodes\/([0-9a-fA-F]{24})$/).respond(sampleNode);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.node).toEqualData(sampleNode);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Nodes) {
			// Create a sample node object
			var sampleNodePostData = new Nodes({
				title: 'An Node about MEAN',
				content: 'MEAN rocks!'
			});

			// Create a sample node response
			var sampleNodeResponse = new Nodes({
				_id: '525cf20451979dea2c000001',
				title: 'An Node about MEAN',
				content: 'MEAN rocks!'
			});

			// Fixture mock form input values
			scope.title = 'An Node about MEAN';
			scope.content = 'MEAN rocks!';

			// Set POST response
			$httpBackend.expectPOST('nodes', sampleNodePostData).respond(sampleNodeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.title).toEqual('');
			expect(scope.content).toEqual('');

			// Test URL redirection after the node was created
			expect($location.path()).toBe('/nodes/' + sampleNodeResponse._id);
		}));

		it('$scope.update() should update a valid node', inject(function(Nodes) {
			// Define a sample node put data
			var sampleNodePutData = new Nodes({
				_id: '525cf20451979dea2c000001',
				title: 'An Node about MEAN',
				content: 'MEAN Rocks!'
			});

			// Mock node in scope
			scope.node = sampleNodePutData;

			// Set PUT response
			$httpBackend.expectPUT(/nodes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/nodes/' + sampleNodePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid nodeId and remove the node from the scope', inject(function(Nodes) {
			// Create new node object
			var sampleNode = new Nodes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new nodes array and include the node
			scope.nodes = [sampleNode];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/nodes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleNode);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.nodes.length).toBe(0);
		}));
	});
}());