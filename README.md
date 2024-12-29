# Leaf-N-Go 🌿

**Leaf-N-Go** is an environmental tech packing tool designed to help outdoor adventurers prepare for their trips with efficiency, sustainability, and customization. The app combines smart packing checklists, eco-friendly recommendations, and AI-powered insights to support responsible, well-prepared outdoor journeys.

Check out a live version of the site [here](https://leaf-n-go.vercel.app/about). This is a personal project and currently funded with my own resources, please don't abuse <3. If you'd like to help fund, you can "Buy me Coffee" [here](https://www.buymeacoffee.com/skiroyjenkins)

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Local Development Setup](#local-development-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features (Subject to Change)

- **Customizable Packing Checklists**: Create tailored lists based on trip length, destination type, and personal preferences.
- **Environmental Impact Insights (WIP)**: View sustainability ratings and eco-friendly alternatives for gear and materials to reduce environmental impact.
- **AI-Powered Suggestions**: Smart packing suggestions and essential reminders, with options to prioritize based on adventure type.
- **User Personas and Preferences (WIP)**: Designed for different types of adventurers, from minimalists to eco-conscious users.
- **Multi-Device Compatibility**: Accessible on smartphones, tablets, and desktops.

---

## Getting Started

To start using Leaf-N-Go, you’ll need to clone the repository, install dependencies, and set up the development environment.

### Prerequisites
- **Node.js** (version 14 or later recommended)
- **npm** (package manager)
- **Git** (to clone the repository)
- **Supabase** Your own [Supabase](https://supabase.com/) project or access to our own (to request access submit a request in [Issues](https://github.com/Kyle-Ski/leaf-n-go/issues). We'll provide you with the api keys.)
- **Anthropic** Your own [Anthropic project](https://console.anthropic.com/dashboard) or access to our own (to request access submit a request in [Issues](https://github.com/Kyle-Ski/leaf-n-go/issues). We'll provide you with the api key.)
- **Weather API** Your own [Weather API](https://www.weatherapi.com/) api key or request access by submitting a request in [Issues](https://github.com/Kyle-Ski/leaf-n-go/issues).

---

## Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kyle-ski/leaf-n-go.git

2. **Navigate to the project directory:**
    ```bash
    cd leaf-n-go

3. **Install dependencies:**
    ```bash
    npm install

4. **Copy `example.env` and get required api keys**
_Checkout the `example.env` for more information._
    ```bash
    cp example.env .env

5. **Get Supabase Running Locally**
* _Follow the [Getting Started Docs](https://supabase.com/docs/guides/local-development/cli/getting-started) to install Supabase_
* _Make sure you have all of the required API keys or have [created your own project](https://supabase.com/)_
* _Follow [this](https://supabase.com/docs/guides/local-development/overview#link-your-project) guide to link your Supabase Project_

    _Only do this step if the schema isn't in your local instance:_
    ```bash
    supabase db pull && supabase db reset
    ```

 - _This should get supabase up and running, make sure to note all of the information printed out to the command line. There will be links to your locally running database, and locally running dashboard._

6. **Acquire Development Credentials or Create a new User**
* Get development log in credentials, or create your own new user in the live Supabase dashboard. You will need to `supabase db pull && supabase db reset` to get the data locally.

7. **Run the development server:**
    ```bash
    npm run dev

8. **Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.**

_If you have any trouble, feel free to submit a request in [Issues](https://github.com/Kyle-Ski/leaf-n-go/issues)._


## Usage
Once installed, you can use the following commands to interact with the project:

* `npm run dev` – Starts the development server.
* `npm run build` – Builds the application for production.
* `npm start` – Runs the production build of the app.
* `npm run lint` – Lints the code for style and syntax issues.

## Contributing
Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a branch: git checkout -b feature/YourFeature.
3. Commit your changes: git commit -m 'Add some feature'.
4. Push to the branch: git push origin feature/YourFeature.
5. Submit a pull request.

## License
This project is licensed under the MIT License – see the [LICENSE](https://github.com/Kyle-Ski/leaf-n-go/blob/main/LICENSE) file for details.

## Contact
Created by [Kyle](https://github.com/Kyle-Ski) – feel free to reach out for feedback, ideas, or collaboration.