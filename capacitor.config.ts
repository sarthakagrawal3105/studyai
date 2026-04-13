import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.studyai.app',
  appName: 'StudyAI',
  webDir: 'out',
  server: {
    // IMPORTANT: Replace this with your actual Vercel/Public URL
    url: 'https://studyai-innovator.vercel.app',
    cleartext: true
  }
};

export default config;
