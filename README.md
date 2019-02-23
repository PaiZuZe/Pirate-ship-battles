# Code name: Pirate-ship-battles

[![Code Climate](https://codeclimate.com/github/mezuro/prezento/badges/gpa.svg)](https://codeclimate.com/github/Herez/Pirate-ship-battles)[![Test Coverage](https://codeclimate.com/github/Herez/Pirate-ship-battles/badges/coverage.svg)](https://codeclimate.com/github/Herez/Pirate-ship-battles/progress/coverage)[![Build Status](https://travis-ci.org/uspgamedev/Pirate-ship-battles.svg?branch=dev)](https://travis-ci.org/uspgamedev/Pirate-ship-battles)

Online multiplayer game about pirates for USPGameDev

## Summary

1. [Install dependencies](#install-dependencies)
2. [Run server](#run-server)
3. [Server on the cloud](#server-on-the-cloud)
4. [Playing the game](#playing-the-game)
5. [Unit testing](#unit-testing)

## 1. Install dependencies <a name="install-dependencies"></a>

To run PSB you only need to install [docker](https://docs.docker.com/install/).

Or you can install [node.js](https://nodejs.org/en/download/package-manager/) and [yarn](https://yarnpkg.com/lang/en/docs/install/#debian-stable). Note that this is not recommended.

## 2. Run server <a name="run-server"></a>

1. If you have docker isntalled

    1. Build an image.

    ```sh
    sudo docker build . -t <image name>
    ```

    2. Run the image.

    ```sh
    sudo docker run -p <any open port on your pc>:2000 -d <image name>
    ```

2. If you installed node.js and yarn.
    1. This command will get the server up and run a bash script to minify the client .js files, thus getting a better load time.

        ```sh
        yarn serve
        ```

    2. Will do the same as the previous command with the change that a python3 script will be used to minify, note the bash script is preferred.

        ```sh
        yarn servep
        ```

    3. This command is for the developers only, not changing anything about any file, just getting the server up.

        ```sh
        yarn up
        ```

## 3. Server on the cloud <a name="server-on-the-cloud"></a>

If you are gonna use some webservice to run the server, run :

```sh
sudo nano /lib/systemd/system/pirates_game.service
```

Now, add

```
[Unit]
Description=pirates
After=network.target

[Service]
Environment=NODE_PORT=80
Type=simple
User=root
ExecStart=/usr/bin/yarn --cwd /home/ubuntu/pirates serve
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

to the file and run :

```sh
sudo systemctl start pirates_game
```

## 4. Playing the game <a name="playing-the-game"></a>

* Open http://localhost:2000 in a modern browser
* Enjoy!

## 5. Unit testing <a name="unit-testing"></a>

We have tests!! Just run :

```sh
yarn test
```

And all our automated unit tests should run and help you see if something broke. We use [Jest](https://jestjs.io/) as our test API.

Any questions, please contact -[@GuilhermeVieira](https://github.com/GuilhermeVieira).