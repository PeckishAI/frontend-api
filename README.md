<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/PeckishAI/frontend-api">
    <img src="https://unicorn-cdn.b-cdn.net/948cea10-692b-4a1d-83ef-fe7e3b42f10b/white-logo---no-background.png?width=104&height=34" alt="Logo" width="210" height="65">
  </a>

<h3 align="center">Peckish Front-end</h3>

  <p align="center">
    Supplier & Restaurants applications
    <br />
    <a href="https://iampeckish.com/"><strong>See website »</strong></a>
    <br />
    <br />
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#tools-configuration">Tools configuration</a></li>
      </ul>
    </li>
    <li><a href="#running-the-app">Running the App</a></li>
    <li><a href="#building-the-app">Building the App</a></li>
    <li><a href="#contribution">Contribution</a></li>
  </ol>
</details>


## About 

This repository is a mono-repository (using Turborepo) that contain the applications for supplier and restaurants. They are built with React. 


<!-- GETTING STARTED -->
## Getting Started

Follow those step to set-up the project on your computer.

### Prerequisites

Before setting up and running the project, ensure you have the following prerequisites installed on your system:

- __Node.js__ (and npm): Of course you need to have npm in order to set-up the project.

- __Yarn__: I recommand you to use yarn as package manager. You can install Yarn globally using npm with the following command: `npm install -g yarn`.

### Installation

1. Clone the repository on your computer
2. Install dependencies using `yarn install` in root of the project
3. That's all !

### Tools configuration

The project uses Prettier and ESLint to ensure a good code style and consistent code formatting

It's not mandatory to install them but it's highly recommanded.
There's a VSCode extension for those.

__Prettier__ :  
1. Install extension [here](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Go to `Files > Preferences > Settings`
3. Search for the `Default Formatter` parameter and select `Prettier`
4. Search also `Format On Save` and check it

__ESLint__ : 
1. Install extension [here](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. Ready to use

If you get some inconsistent errors and you don't know how to use eslint, do not hesitate to ask me.

## Running the App

You can start the both application using one command :
`yarn dev` 

But you can also launch each project separatly using `yarn dev --filter app_name` or by using `yarn dev` inside the desired app folder.

## Building the App

To build all the apps : `yarn build`

To build a specific app : `yarn build --filter app_name`


## Contribution

When you need to create a component that need to be shared by the both apps follow this steps :

1. Go inside the `packages/ui` folder
2. Create your component in the right folder 
3. Inside the root `index.ts` import it and add it in the export line
4. That's all ! The component should be accessible in your app and all the change you made on it will be reflected directly 

<p align="right">(<a href="#readme-top">back to top</a>)</p>
