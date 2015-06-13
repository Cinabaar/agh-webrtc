'use strict';

angular.module('publicApp')
  .controller('RoomCtrl', function ($sce, VideoStream, $location, $routeParams, $scope, Room) {
    $scope.alerts = [];
    if (!window.RTCPeerConnection) {
      $scope.alerts.push({ type: 'danger', msg: 'RTC is most likely not supported by your browser.' });
      return;
    }
    if (!navigator.getUserMedia) {
      $scope.alerts.push({ type: 'warning', msg: 'Unable to get media.' });
      return;
    }

    var stream;

    VideoStream.get()
    .then(function (s) {
      stream = s;
      Room.init(stream);
      stream = URL.createObjectURL(stream);
      if (!$routeParams.roomId) {
        Room.createRoom()
        .then(function (roomId) {
          $location.path('/room/' + roomId);
        });
      } else {
        Room.joinRoom($routeParams.roomId);
      }
    }, function () {
      $scope.alerts.push({ type: 'warning', msg: 'No audio/video permissions' });
    });
    $scope.peers = [];
    Room.on('peer.stream', function (peer) {
      $scope.peers.push({
        id: peer.id,
        stream: URL.createObjectURL(peer.stream)
      });
    });
    Room.on('peer.disconnected', function (peer) {
      $scope.peers = $scope.peers.filter(function (p) {
        return p.id !== peer.id;
      });
    });

    $scope.getLocalVideo = function () {
      return $sce.trustAsResourceUrl(stream);
    };

    $scope.closeAlert = function(index) {
      $scope.alerts.splice(index, 1);
    };
  });
