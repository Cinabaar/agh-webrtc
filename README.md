# AGH-WEBRTC
Projekt demonstrujący możliwośći protokołu WebRTC w zakresie przesyłania strumienia video i audio.

Demo: https://intense-springs-6866.herokuapp.com/

## Technologie
Projekt został napisany w javascripcie wykorzystując node.js po stronie serwera i angular.js po stronie klienckiej.
Kluczowymi elementami wykonania projektu są także framework webowy express, implementacja websocketów dla node.js 
socket.io oraz api WebRTC dostępne w nowoczesnych przeglądarkach.

## Wykonanie

### Zasada działania

1) Klient wchodzi na stronę https://intense-springs-6866.herokuapp.com/

2) Generowany jest pokój dla klienta i klient jest do niego dodawany. Pokój jest identyfikowany przez GUID, 
który pojawia się w pasku adresu. Klient otrzymuje GUID oraz swoje id w pokoju.

3) Inny klient po otrzymaniu adresu wraz z GUIDem pokoju również wchodzi na stronę.

4) Serwer dodaje klienta do pokoju. Klient otrzymuje kolejny numer jako id. 
Pozostali klienci w pokoju otrzymują dane nowego klienta

5) Klienci w pokoju próbują nawiązać połączenie protokołem ICE  (Interactive Connectivity Establishment)
wykorzystującym protokół STUN (Session Traversal Utilities for NAT)

6) Po nawiązaniu połączenia dalsza komunikacja odbywa się na zasadzie p2p, bez udziału serwera, 
z wykorzystaniem protokoły WebRTC 

![Flow diagram](http://i.imgur.com/WvvDGLR.png)


### Wybrane elementy implementacji

#### Serwer

Po stronie serwera kluczowa jest implementacja trzech callbacków:

socket.on('init', function (data, fn) {});

socket.on('msg', function (data) {});

socket.on('disconnect', function () {});

Pierwszy z nich ma za zadanie wykonanie punktu 2 w powyższej listy.

Drugi jest wykorzystywany przed nazwiązaniem komunikacji p2p do przesyłania wiadomości w ramach protkołu STUN.
Kiedy klienci próbują nazwiązać komunikację, wysyłane są przez websockety wiadomości: sdp-offer, sdp-answer oraz ice,
które muszą być przez serwer przekazane dalej do odpowiedniego klienta.

Trzeci jest wywoływany kiedy połączenie padnie, w celu usunięcia klienta z listy.

#### Klient

Po stronie klienta, kluczowa jest fabryka "Room", która udostępnia api do komunikacji oraz kontroler Room, 
które to api wykorzystuje. oprócz tego wykorzystywane są także serwisy videostream do pobierania strumienia wideo,
io do socketów oraz dyrektywa videoPlayer, która renderuje element video ze zdalnym strumieniem.

Serwis room:

getPeerConnection - zwraca RTCPeerConnection z podpiętymi callbackami obsługującymi próby nawiązania połączenia i samo połączenie

makeOffer - wysyła ofertę nawiązania połączenia

handleMessage - obsługuje różne możliwe dane zawarte w wiadomości "msg"

- po otrzymaniu sdp-offer tworzymy obiekt RTCSessionDescription z przesłanych danych, ustawiamy 
remoteDescription na ten obiekt i wysyłamy sdp-answer
- po otrzymaniu sdp-answer tworzymy obiekt RTCSessionDescription z przesłanych danych i ustawiamy 
remoteDescription na ten obiekt
- po otrzymaniu ice dodajemy nowego ice kandydata

addHandlers - obsługuje podstawowe wiadomości wysyłane przed websockety. Kiedy otrzyma msg, wywołuje handleMessage

api - obiekt, z podstawowymi funkcjami obsługiwanymi przez serwis. Ma ustawiony prototyp na "EventEmitter.prototype" 
więc obsługuje także funkcję "trigger", która wysyła event i "on", którą można się się zapisać na eventy.

Fabryka VideoStream:

- zwraca obietnicę, która później zawiera strumień wideo

Fabryka Io:

- wrappuje moduł io, żeby dało się go wstrzykiwać do angularowych kontrolerów, serwisów itp.

Kontroler Room:

- pobierz strumień video
- stwórz, lub dodaj się do odpowiedniego pokoju
- wrzuć guid pokoju do url
- kiedy otrzymasz peer.streem, dodaj strumień do listy dostępnych strumieni

### Instalacja lokalna

Jako, że wykorzystane zostały standardowe narzędzia (yeoman, npm, bower), instalacja powinna być bardzo prosta.

#### Wymagania

Zainstalowany npm, node.js, bower

#### Instrukcja instalacji

W katalogu głównym: npm install

W katalogu public: npm install && bower install

#### Instrukcja uruchomienia

W katalogu głównym: node index.js

#### Wszystko razem

cd agh-webrtc

npm install

cd public 

npm install && bower install

cd ..

node index.js


### Potencjalne dodatki / usprawnienia

- Przy dużej ilości klientów może działać wolno ponieważ strumień jest każdorazowo kompresowany i wysyłany po stronie klienta do każdego z pozostałych klientów.
- W tym momencie jeśli użytkownik nie da uprawnień do video to nic nie będzie działało. Wynika to z tego, że cała logika programu jest callbackiem na uzyskanie uprawnień. Można to dość łatwo zmienić, ale na obecną chwilę działa zadowalająco.
- Można dodać chat.


