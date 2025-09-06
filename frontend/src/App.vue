<template>
  <!-- v-app is the main Vuetify component that wraps your app -->
  <v-app :dark="isDarkMode">
    <!-- v-app-bar is the navigation bar at the top -->
    <v-app-bar app color="#212121">
      <v-toolbar-title class="white--text">
        <v-avatar size="24" tile class="mr-2">
          <img src="@/assets/threat.png" alt="Threat">
        </v-avatar>
        Threat Analyzer
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Dark mode toggle button -->
      <v-btn text class="white--text" @click="toggleDarkMode">
        <v-icon left>{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
        {{ isDarkMode ? 'Light' : 'Dark' }}
      </v-btn>

      <!-- Simulator button -->
      <v-btn text class="white--text" @click="openSimulator">
        <v-icon left>mdi-training</v-icon>
        Simulator
      </v-btn>

      <!-- Conditional rendering: Show Sign In/Sign Up when not logged in -->
      <v-btn
        v-if="!isLoggedIn"
        outlined
        color="white"
        @click="showLogin = true"
      >
        <v-icon left>mdi-login</v-icon>
        Sign in
      </v-btn>
      <v-btn
        v-if="!isLoggedIn"
        color="blue"
        class="ml-2"
        @click="showSignup = true"
      >
        <v-icon left>mdi-account-plus</v-icon>
        Sign up
      </v-btn>

      <!-- Show Logout when logged in -->
      <v-btn
        v-if="isLoggedIn"
        color="red"
        class="ml-2"
        @click="logout"
      >
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <!-- v-main holds the main content that Vue Router will render -->
    <v-main>
      <router-view></router-view>
    </v-main>

    <!-- The Incident Response Simulator is a full-screen dialog -->
    <v-dialog
      v-model="showSimulator"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <Simulator @close="showSimulator = false" />
    </v-dialog>

    <!-- New Sign-up Dialog -->
    <v-dialog
      v-model="showSignup"
      max-width="500"
      content-class="transparent-dialog"
    >
      <Signup
        @close="showSignup = false"
        @open-signin="showLogin = true; showSignup = false;"
      />
    </v-dialog>

    <!-- New Sign-in Dialog -->
    <v-dialog
      v-model="showLogin"
      width="500"
      height="400"
    >
      <SignIn
        @close="showLogin = false"
        @open-signup="showLogin = false; showSignup = true;"
        @login-success="onLoginSuccess"
      />
    </v-dialog>
  </v-app>
</template>

<script>
import Simulator from './components/Simulator.vue';
import Signup from './components/SignUp.vue';
import SignIn from './components/SignIn.vue';

export default {
  name: 'App',
  components: {
    Simulator,
    Signup,
    SignIn,
  },
  data() {
    return {
      showSimulator: false,
      showSignup: false,
      showLogin: false,
      isDarkMode: true,
      isLoggedIn: false,  // Track user login state
    };
  },
  methods: {
    toggleDarkMode() {
      this.isDarkMode = !this.isDarkMode;
      this.$vuetify.theme.dark = this.isDarkMode;
    },
    onLoginSuccess() {
      this.isLoggedIn = true;
      this.showLogin = false;
      this.showSignup = false;
    },
    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem('token');
      this.$router.push('/'); // Redirect user after logout if needed
    },
    openSimulator() {
      if (this.isLoggedIn) {
        this.showSimulator = true;
      } else {
        this.showLogin = true;  // Show login modal if user NOT logged in
      }
    }
  },
  mounted() {
    // Optional: check if user token exists on app load
    if (localStorage.getItem('token')) {
      this.isLoggedIn = true;
    }
  },
};
</script>

<style scoped>
.terminal {
  background-color: #1E1E1E !important;
  font-family: 'Roboto Mono', monospace;
  color: #E0E0E0;
  line-height: 1.6;
}
.log-entry {
  opacity: 0;
  animation: fadeIn 0.5s forwards;
  margin-bottom: 12px;
}
.log-time { color: #888; margin-right: 15px; }
.log-source-system { color: #00BCD4; font-weight: bold; }
.log-source-user { color: #FFD54F; font-weight: bold; }
.log-source-alert { color: #F44336; font-weight: bold; text-transform: uppercase; }
.choice-card { background-color: #2a2a2a !important; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* A class to make the v-dialog background transparent */
.transparent-dialog {
  box-shadow: none !important;
  background-color: transparent !important;
}
</style>
