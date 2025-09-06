<template>
  <v-card class="pa-5 rounded-xl" height="420" width="1000">
    <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
      Sign Up
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent="signUp">
        <v-text-field
          v-model="name"
          label="Name"
          prepend-inner-icon="mdi-account"
          outlined
          dense
          :rules="[rules.required]"
          class="mb-2"
        ></v-text-field>
        <v-text-field
          v-model="email"
          label="Email"
          prepend-inner-icon="mdi-email"
          outlined
          dense
          :rules="[rules.required, rules.email]"
          class="mb-2"
        ></v-text-field>

        <v-text-field
          v-model="password"
          label="Password"
          prepend-inner-icon="mdi-lock"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
          outlined
          dense
          :rules="[rules.required]"
        ></v-text-field>

        <v-btn
          color="primary"
          block
          :loading="loading"
          type="submit"
          class="mt-4"
        >
          Sign Up
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="d-flex justify-center">
      <span class="text-caption">Already a user? </span>
      <v-btn text color="primary" small @click="$emit('open-signin')">
        Sign in
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SignUp',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      rules: {
        required: value => !!value || 'Required.',
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return pattern.test(value) || 'Invalid e-mail.';
        },
      },
    };
  },
  methods: {
    async signUp() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          // Backend API call to register user
          await this.$axios.post('http://localhost:5000/api/auth/register', {
            name: this.name,
            email: this.email,
            password: this.password,
          });
          alert('Signup successful! Please sign in.');

          this.$emit('close');        // Close signup modal
          this.$emit('open-signin');  // Open signin modal immediately
        } catch (err) {
          alert(err.response?.data?.message || 'Signup failed');
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
