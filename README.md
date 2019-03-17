# Code name: PSB2: Eletric Boogaloo

We will take Pirate Ship Battles to space!!!!
The orignal game was a project from USPgameDev, that later went be a project from one class, and now in it's third development cycle, alot of changes will happen. 

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

1. Install docker and docker-compose:

2. Build an run:

    ```sh
    sudo docker-compose build
    sudo docker-compose up
    ```

    Use the flag -d when putting the containers up so they are in background.

    Be sure that postgres is not running on the host machine.

    ```sh
    sudo service postgres stop
    ```

    Remember to end the containers and remove their images.

    ```sh
    sudo docker-compose kill
    sudo docker-compose rm
    ```

    Note: A folder named pgdata will be create the first time you build the images, remember to delete it if you want to reset your database.


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

Note: This may not work with docker.

Any questions, please contact -[@GuilhermeVieira](https://github.com/GuilhermeVieira).
