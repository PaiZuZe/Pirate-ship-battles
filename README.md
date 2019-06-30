# Code name: PSB2: Eletric Boogaloo

Actual name: Spac.io

We will take Pirate Ship Battles to space!!!!
The orignal game started as a project from USPgameDev, that later went to be one of the projects from one class, and now in it's third development cycle, alot of changes will happen, and it will finally become a okay game CUZ I NOW WHAT A GOOD GAME IS TALKEI ?. 

## Summary

1. [Install dependencies](#install-dependencies)
2. [Run server](#run-server)
3. [Playing the game](#playing-the-game)

## 1. Install dependencies <a name="install-dependencies"></a>

To run SSB you only need to install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/). And everything else will be done for you like magic.

## 2. Run local server <a name="run-server"></a>

1. Install all depencies:

2. Build an run:

    ```sh
    sudo docker-compose build
    sudo docker-compose up
    ```

    You can run the game on background by using the flag -d.

    Notice: Be sure that postgres is not running on the host machine.

    ```sh
    sudo service postgresql stop
    ```

    Note: A folder named pgdata will be create the first time you build the images, remember to delete it if you want to reset your database.

3. Remember to stop the containers and remove the images:


## 3. Playing the game <a name="playing-the-game"></a>

* Open http://localhost:2000 on your browser of choice.
* Enjoy!

## 4. Seting up a server

All you have to do is change the docker-compose.yml file and some other voodoo.

Any questions, please contact -[@GuilhermeVieira](https://github.com/GuilhermeVieira).
