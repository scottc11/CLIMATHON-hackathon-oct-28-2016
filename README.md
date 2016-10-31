# CLIMATHON-hackathon-oct-28-2016
A demo project for the Toronto Climathon/Hackathon which interacts with a variety of open APIs

The goal with this project was to find a way to reduce Co2 emmisions by eliminating unnecessary TTC bus routes.

The code essentially uses one 'stop' on a bus route, and applies a dummy button to that stop which when 
clicked tells the next closest bus driving on that route to take the appropriate detour to pick that passenger up.

In order to achieve this, we interact with an opensource data supplier called NextBus to obtain the longitude and 
lattitude of a specific bus in real-time, and then make an additional request to the GoogleMaps API in order to return 
a proper route to the longitude and latitude of a specific bus stop.

