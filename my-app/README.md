# Matt Isaac — Portfolio App

This is the React application behind my portfolio site. I'm an embedded firmware engineer focused on STM32, RTOS, and wireless IoT systems (Computer Engineering, University of Manitoba, based in Winnipeg, Canada). The site presents my engineering work with an interactive black hole intro, animated particle background, smooth section navigation, and expandable project cards for web, AI, machine learning, embedded systems, PCB design, and creative technical work.

- LinkedIn: https://www.linkedin.com/in/matthew-i-7785b0277/
- GitHub: https://github.com/isaacmatt
- Email: matt.isaac.dev@gmail.com

The app was developed as a collaborative frontend project, combining hands-on JavaScript and React implementation with AI-assisted design and iteration, including collaboration with Claude for UI ideas, copy refinement, and interactive behavior planning.

## Features

- React-based single page portfolio interface
- Interactive black hole animation with hover, click, keyboard, and video playback effects
- Canvas particle field that responds to pointer movement
- Smooth navigation between intro and work sections
- Expandable work highlight cards with tags, categories, and repository links
- Responsive styling for desktop and mobile layouts
- GitHub Pages deployment setup

## Tech Stack

- JavaScript
- React
- CSS
- Create React App
- HTML canvas
- GitHub Pages

## Project Structure

- `src/App.js` contains the main React component, portfolio data, animation state, canvas logic, and project card rendering.
- `src/App.css` contains the visual styling, responsive layout, animation effects, and card presentation.
- `public/` contains static assets used by the deployed site.

## Available Scripts

From the `my-app` directory, run:

### `npm start`

Starts the development server at [http://localhost:3000](http://localhost:3000).

### `npm run build`

Creates an optimized production build in the `build` folder.

### `npm test`

Runs the test runner in watch mode.

### `npm run deploy`

Builds and deploys the app to GitHub Pages using the configured `homepage` value.

## Live Site

The app is configured for deployment at:

https://isaacmatt.github.io

## Collaboration Notes

This project reflects an iterative development workflow using React and JavaScript as the core implementation tools. Claude was used as a collaborative assistant during parts of the process to explore interface direction, refine portfolio wording, and think through interactive presentation details, while the final app structure and implementation remain grounded in the repository's React code.
