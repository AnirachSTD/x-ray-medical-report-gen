# AI X-Ray Report Generator

This is a sophisticated web application that leverages the Google Gemini API to analyze medical X-ray images and generate detailed, structured medical reports. It is designed as an intelligent assistant for radiologists and medical professionals, providing a preliminary analysis that can be reviewed, refined, and improved over time through a persistent knowledge base.

## Project Concept

The core idea is to create an interactive and learning tool for radiology. A user can upload one or more X-ray films, and the application, powered by the Gemini model, performs a detailed analysis. The output is a professional medical report, complete with sections for findings, impressions, recommendations, and differential diagnoses.

A key feature is the **Expert Knowledge Base**. This allows users to save corrections, feedback, or important radiological notes (e.g., "Always check for subtle signs of Multiple Myeloma"). The AI consults this knowledge base before every new analysis, effectively learning from past human expertise to improve the accuracy and relevance of future reports. Users can also provide immediate feedback on a generated report to get a refined version on the spot.

**Disclaimer:** This tool is for educational and research purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. All AI-generated findings should be reviewed and verified by a qualified healthcare professional.

## Tech Stack

-   **Frontend:**
    -   [React](https://reactjs.org/) (with TypeScript)
    -   [Tailwind CSS](https://tailwindcss.com/) for styling and responsive design.
-   **AI Model:**
    -   [Google Gemini API](https://ai.google.dev/gemini-api) (`@google/genai` library) for powerful multimodal analysis (interpreting both images and text prompts).
-   **PDF Generation:**
    -   [jsPDF](https://github.com/parallax/jsPDF) for exporting reports to a portable format.
-   **Local Storage:**
    -   Browser `localStorage` is used to persist the Expert Knowledge Base on the user's machine.

## Features

-   **Multi-Image Upload:** Supports drag-and-drop or file selection for multiple X-ray images in a single analysis session.
-   **AI-Powered Analysis:** Utilizes the Gemini model's advanced multimodal capabilities to "read" X-ray images and generate insightful text.
-   **Structured Reporting:** Generates reports in a standardized medical format, making them easy to read and understand.
-   **Persistent Knowledge Base:** Users can add, edit, and delete expert notes. This knowledge is used to prime the AI for all subsequent analyses, creating a continuous learning loop.
-   **Iterative Refinement:** Provides an interface for doctors to give feedback on a generated report, which is then used to create a revised and more accurate version instantly.
-   **PDF Export:** Allows users to download the final medical report as a universally compatible PDF document.
-   **Responsive Design:** The user interface is fully responsive and designed to work seamlessly on desktops, tablets, and mobile devices.

## How to Run Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   npm (comes with Node.js)
-   A Google Gemini API Key. You can get one from **[Google AI Studio](https://aistudio.google.com/app/apikey)**.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/ai-xray-report-generator.git
    cd ai-xray-report-generator
    ```

2.  **Install NPM packages:**
    This will install all the necessary dependencies for the project, including React and the Google GenAI library.
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a new file named `.env` in the root of your project directory. Add your Google Gemini API key to this file. The application is configured to automatically load this key.
    ```
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

4.  **Run the development server:**
    This command starts the local development server.
    ```sh
    npm run dev
    ```

5.  **Open the application:**
    Open your web browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173` or a similar address). You can now start uploading X-ray images.
