[comment]: <> ([![License badge]&#40;https://img.shields.io/badge/license-Apache2-orange.svg&#41;]&#40;http://www.apache.org/licenses/LICENSE-2.0&#41;)

[comment]: <> ([![Documentation badge]&#40;https://readthedocs.org/projects/fiware-orion/badge/?version=latest&#41;]&#40;https://doc-kurento.readthedocs.io&#41;)

[comment]: <> ([![Docker badge]&#40;https://img.shields.io/docker/pulls/fiware/orion.svg&#41;]&#40;https://hub.docker.com/r/fiware/stream-oriented-kurento/&#41;)

[comment]: <> ([![Support badge]&#40; https://img.shields.io/badge/support-sof-yellowgreen.svg&#41;]&#40;https://stackoverflow.com/questions/tagged/kurento&#41;)

[comment]: <> ([![][KurentoImage]][Kurento])

[comment]: <> (Copyright 2018 [Kurento]. Licensed under [Apache 2.0 License].)

[Kurento]: https://kurento.org
[KurentoImage]: https://secure.gravatar.com/avatar/21a2a12c56b2a91c8918d5779f1778bf?s=120
[Apache 2.0 License]: http://www.apache.org/licenses/LICENSE-2.0

# Information
- kurento-group-call is the SFU application used
- kurento-furkan-mcu is the MCU used
- kurento-furkan-dmcu-1, kurento-furkan-dmcu-2 and kurento-furkan-mcu is the DMCU tested
- kurento-furkan-mmcu-1 and mmcu-2 are the DMCU unit-2-unit approach that does not work as intended due to bug in Kurento.
- kurento-furkan-dsfu-1, dsfu-2 together with node-dsfu-router is the DSFU tested
- node-webrtc-sfu is our own SFU

# Requirements
- Make sure Kurento Media Server is installed, a local installation is recommended see https://doc-kurento.readthedocs.io/en/stable/user/installation.html#local-installation for more information
  - Kurento Media Server can also be installed via Docker by running `sudo docker run -d --name kms --network host kurento/kurento-media-server:6.15`  
- Make sure that Java 8, Maven, Node.js (we use v16.3.0) and npm are installed

# How to Run

## How to run a Kurento Java Application
- Make sure that Java 8, Maven, Node.js and Kurento Media Server are installed
- Run a Kurento application by moving in the respective directory i.e. `kurento-group-call` and run `mvn -U clean spring-boot:run`, make sure that Kurento Media Server is running

## How to run the DSFU
- Make sure node and npm are installed and ports 8000, 8001 and 8002 are available
- Run node-dsfu-router by `npm install; node index.js`
- Run kurento-furkan-dsfu-1 and kurento-furkan-dsfu-2 (see above)
- go to http://localhost:8001/ in multiple tabs

## How to run the DMCU
- Make sure node and npm are installed and ports 8000, 8001 and 8002 are available
- Run kurento-furkan-mcu (see "How to run a Kurento Java Application")
- Run kurento-furkan-dmcu-1 and kurento-furkan-dmcu-2
- open http://localhost:8001/ for MCU 1 and http://localhost:8002/ for MCU 2, both show the result from their parent MCU

## How to run our own SFU built with node.js
- Note: bad performance due to limitations of the WebRTC engine used
- navigate to node-webrtc-sfu
- `npm install`
- `npm start`
- visit https://localhost:8443

## How to run the MCU
- Run kurento-furkan-mcu (see "How to run a Kurento Java Application")
- visit http://localhost:8443/

## How to run the SFU
- Run kurento-furkan-mcu (see "How to run a Kurento Java Application")
- visit https://localhost:8443/


[comment]: <> (Kurento Java tutorials)

[comment]: <> (======================)

[comment]: <> (Demo applications that showcase how to use the Kurento Java Client.)



[comment]: <> (About Kurento)

[comment]: <> (=============)

[comment]: <> (Kurento is an open source software project providing a platform suitable for creating modular applications with advanced real-time communication capabilities. For knowing more about Kurento, please visit the Kurento project website: https://www.kurento.org.)

[comment]: <> (Kurento is part of [FIWARE]. For further information on the relationship of FIWARE and Kurento check the [Kurento FIWARE Catalog Entry]. Kurento is also part of the [NUBOMEDIA] research initiative.)

[comment]: <> ([FIWARE]: http://www.fiware.org)

[comment]: <> ([Kurento FIWARE Catalog Entry]: http://catalogue.fiware.org/enablers/stream-oriented-kurento)

[comment]: <> ([NUBOMEDIA]: http://www.nubomedia.eu)



[comment]: <> (Documentation)

[comment]: <> (-------------)

[comment]: <> (The Kurento project provides detailed [documentation] including tutorials, installation and development guides. The [Open API specification], also known as *Kurento Protocol*, is available on [apiary.io].)

[comment]: <> ([documentation]: https://www.kurento.org/documentation)

[comment]: <> ([Open API specification]: http://kurento.github.io/doc-kurento/)

[comment]: <> ([apiary.io]: http://docs.streamoriented.apiary.io/)



[comment]: <> (Useful Links)

[comment]: <> (------------)

[comment]: <> (Usage:)

[comment]: <> (* [Installation Guide]&#40;http://doc-kurento.readthedocs.io/en/stable/user/installation.html&#41;)

[comment]: <> (* [Compilation Guide]&#40;http://doc-kurento.readthedocs.io/en/stable/dev/dev_guide.html#developing-kms&#41;)

[comment]: <> (* [Contribution Guide]&#40;http://doc-kurento.readthedocs.io/en/stable/project/contribute.html&#41;)

[comment]: <> (Issues:)

[comment]: <> (* [Bug Tracker]&#40;https://github.com/Kurento/bugtracker/issues&#41;)

[comment]: <> (* [Support]&#40;http://doc-kurento.readthedocs.io/en/stable/user/support.html&#41;)

[comment]: <> (News:)

[comment]: <> (* [Kurento Blog]&#40;https://www.kurento.org/blog&#41;)

[comment]: <> (* [Google Groups]&#40;https://groups.google.com/forum/#!forum/kurento&#41;)



# Source

All source code belonging to the Kurento project can be found in the [Kurento GitHub organization page].

[Kurento GitHub organization page]: https://github.com/Kurento



# Licensing and distribution

Copyright 2018 Kurento

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
