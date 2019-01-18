# Game Engine

As part of a class project for
CSC 481/591 course at NCSU, we have developed a simple 2D game engine.

## Sample Games

[Little Alchemy](LittleAlchemy/index.html)

[Snake](Snake/index.html)

[Bubble Shooter](BubbleShooter/index.html)

[Local Snake 2](LocalMultiplayerSnake/index.html)

[Networked Snake 2](MultiplayerSnake/index.html)

[Cops and Robbers](CopsRobbers/index.html)

## Features and Subsystems

Our game engine, although simple, comprises many cool features of a modern game engine.

### Component and Inheritance Based

Our game engine maintains a mixture of both architectures. It defines a hierarchy of classes and supports further inheritances. At the same time, it maintains a list of different components, e.g., sprites, timers, and scores. The Sprite class has an array of instances of the Picture class. The mixture provides the developers with a certain amount of flexibility and design choices.

### Platform: Browser

Our engine uses HTML canvas, and JavaScript. Thus, it is cross compatible with different OS. It is tested on the most recent versions, as of the release date, of Chrome, Firefox, and Microsoft Edge browsers. It should be compatible with other browsers. We do not guarantee that it will support a very old version of a browser though.

### Sprites, Scores, and Timers

All entities in our engine are sprites (except scores, timers, and the elements in heads-up-display). A sprite may have an imported image, or just a basic shape. To be more specific, each sprite may have an array of pictures; each component picture may be object of different classes. These classes can be extended by the developer. Our engine supports scoring. It provides a session storage for high score of any game developed in it. However, a game may not use this storage, if not required. It also facilitates defining and displaying timers. In addition, it allows passing a function to be triggered by a timer event. We also provide the system time, and the delta between update calls.

### I/O

Our engine provides a basic interface for keyboard and mouse events. Any game-specific i/o functionality must be implemented by the developer.

### Rendering Loop

Our engine maintains the basic rendering loop. The FPS is hardcoded to 60; it may be changed by the developer for any game. It also defines the basic end-game functionality.

### Rendering Subsystem

Our engine renders sprites. It also facilitates a heads-up-display to show scores and timers. It can render any image supported by the current JavaScript version for HTML canvas. For imported images, it does not support any rotation; it permits only axis aligned rectangular images. However, it also supports drawing basic shapes. A sprite may be not drawable as well.

### Shading Pipeline

Before drawing the sprites, a shading function is called by the engine, which needs to be provided by the developer if any shading is required.

### Animation

Our engine supports spritesheet-based animations.

### Particle System

We have not implemented any generalized particle system in our engine. The developers need to extend the Sprite and the GridSprite classes in a meaningful way to create a particle system. An example is provided in the Bubble Shooter game.

### Collision Subsystem

The axis aligned bounding boxes of all sprite pictures are maintained in a quad-tree. Once the bounding boxes of two pictures collide, a call to a narrow-phase function is made to determine whether the pictures have actually collided. This function may be overridden by the developer to define game-specific narrow-phase collision detection. Again, an object may be not collidable. Our engine only detects collisions; upon detection it calls a method to resolve collisions, which must be provided by the developers.

### Physics

We support collision as mentioned. Any movement, or other physics must be defined by the developer.

### Networking Subsystem

Our engine provides basic networking facility over Peer.js. More complex networking must be defined by the developer by extending the provided classes.

### AI Subsystem

Our engine provides generalized search algorithms, like BFS and A*, over a grid. The specific constraints may be passed to those procedures by the developer. We have not implemented any decision/behavior tree due to time constraints.

### Data Structures, and Math Libraries

We have implemented a basic queue, a binomial heap, and a quad tree inside the engine. The developers may use these, and basic data structures of JavaScript. We have provided a few mathematical functions as well.

## Getting Started

To download this engine and get started on a game, download the zip file containing all engine files. Once you have downloaded the engine, you will need to start by creating a JavaScript file that will contain all game code.

## File Overview

Our engine is segmented into several JavaScript files, which helps keep things manageable when making changes to the engine.

### Engine.js

This file contains the basic functions needed for the engine to run. This includes the initialization function, the game loop, draw and update functions, and the game end function.

### Entities.js

Here is all of the different types of objects that are instantiable in a game. The most common classes to inherit from in this file are Sprite and Picture, which allows objects to be displayed and interacted with in the game.

### Collision.js

This file contains all the needed collisions functions, including a quad tree to optimize collision detection. The actual quad tree implementation is in the ds.js file.

### Other

Other files, such as utilities.js and keyboard.js provide additional utilities for the engine.

## Necessary Functions

To start making a game, there are several functions that need to be written in the game JavaScript file.

### contentInit

This function contains initialization code for the game, and is run once before the game loop starts. Use this method to set up a level, create objects, and set any variables needed.

### contentUpdate

This is the main update function of the game. This will run every tick (defined in the engine.js file), and should be used to update any necessary objects during gameplay.

### contentDraw / contentShade

These are also called every tick, and are used to draw all objects in the scene. Also draw any HUD elements in these methods.

### resolveCollisions

This method handles all collisions during the game. The parameters for this function are the sprite id, picture id, and collision candidates, respectively. Because all collisions are handled inside this one method, you need to check the type of object being collided, and then handle any resolutions. See example projects for a sample method.

### selectMousePics

Allows the player to click on pictures. Runs a collision detection on the x, y position of the mouse to find any picture on the same spot.



Once these methods are overridden, the game should be able to run. To add functionality, you will need to override the Sprite class and create some basic objects for the game, as well as a level. Extending the MouseActions and KeyActions classes allows you to add user input to your game. See the example gallery for sample code.
