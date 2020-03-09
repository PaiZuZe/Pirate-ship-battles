# SSB: Space Ship Battles

We will take Pirate Ship Battles to space!!!!
The orignal game started as a project from USPgameDev, that later went to be one of the projects for a agile methods class.

Now in it's third development cycle, alot of changes happend. This include, the theme change from the open seas to space and the use of Type Script.

## Summary

1. [Install dependencies](#install-dependencies)
2. [Run server](#run-server)
3. [Playing the game](#playing-the-game)

## 1. Install dependencies <a name="install-dependencies"></a>

To run SSB you only need to install [docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/install/). And everything else will be done for you, like magic.

## 2. Run local server <a name="run-server"></a>

1. Install all depencies:

2. Build an run:

    ```sh
    sudo docker-compose build
    sudo docker-compose up
    ```

    You can run the game server on background by using the flag -d.

    Notice: Be sure that postgres is not running on the host machine.

    ```sh
    sudo service postgresql stop
    ```

    Note: A folder named pgdata will be create the first time you build the images, deleting this folder is a quick and dirty way of purging your database.

3. Remember to stop the containers and remove the images if you wish to not host a server anymore.


## 3. Playing the game offline <a name="playing-the-game"></a>

* Open http://localhost:2000 on your browser of choice.
* Enjoy!

## 4. Seting up a server

All you have to do is change the docker-compose.yml file and some other voodoo.

Any questions, please contact -[@GuilhermeVieira](https://github.com/GuilhermeVieira).
