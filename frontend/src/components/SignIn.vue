<template>
  <v-card class="pa-5 rounded-xl">
    <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
      Sign In
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text>
      <v-form ref="form" @submit.prevent="signIn">
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
          Sign In
        </v-btn>
      </v-form>
    </v-card-text>
    <v-card-actions class="d-flex justify-center">
      <span class="text-caption">New user? </span>
      <v-btn text color="primary" small @click="$emit('open-signup')">
        Sign up
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'SignIn',
  data() {
    return {
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
    async signIn() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        try {
          const response = await this.$axios.post('http://localhost:5000/api/auth/login', {
            email: this.email,
            password: this.password,
          });
          localStorage.setItem('token', response.data.token);

          this.$emit('close');           // Close modal immediately on success
          this.$emit('login-success');   // Notify parent about login success
          this.$router.push('/simulator');  // Redirect to simulator page
        } catch (err) {
          alert(err.response?.data?.message || 'Login failed');
        } finally {
          this.loading = false;
        }
      }
    },
  },
};
</script>
