<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="12" lg="10">
        <v-card class="pa-5" :dark="isDarkMode" :light="!isDarkMode">
          <v-card-title class="headline text-center justify-center">
            <img src="@/assets/threat.png" alt="Threat" height="40" class="mr-2" />
            <span :class="isDarkMode ? 'white--text' : 'black--text'">Threat Analyzer</span>
          </v-card-title>
          <v-divider :class="isDarkMode ? 'white--text' : 'black--text'" />

          <!-- Tabs -->
          <v-tabs
            v-model="tab"
            :dark="isDarkMode"
            :light="!isDarkMode"
            centered
            :slider-color="isDarkMode ? 'white' : 'black'"
          >
            <v-tab href="#tab-url">URL</v-tab>
            <v-tab href="#tab-file">File</v-tab>
            <v-tab href="#tab-search">Search</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <!-- URL Tab -->
            <v-tab-item value="tab-url">
              <v-card-text>
                <v-form ref="urlForm">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="Enter URL"
                        v-model="url"
                        placeholder="https://www.example.com"
                        solo
                        :dark="isDarkMode"
                        :light="!isDarkMode"
                        clearable
                        :rules="urlRules"
                        :disabled="loading"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-btn
                        color="primary"
                        block
                        @click="validateAndScan('url', 'urlForm')"
                        :loading="loading"
                        :disabled="loading"
                      >
                        Analyze
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-tab-item>

            <!-- File Tab -->
            <v-tab-item value="tab-file">
              <v-card-text>
                <v-form ref="fileForm">
                  <v-row>
                    <v-col cols="12">
                      <v-file-input
                        label="Choose a file to analyze"
                        v-model="file"
                        placeholder="No file selected"
                        solo
                        :dark="isDarkMode"
                        :light="!isDarkMode"
                        icon="mdi-paperclip"
                        :rules="fileRules"
                        :disabled="loading"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-btn
                        color="primary"
                        block
                        @click="validateAndScan('file', 'fileForm')"
                        :loading="loading"
                        :disabled="loading"
                      >
                        Analyze
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-tab-item>

            <!-- Search Tab -->
            <v-tab-item value="tab-search">
              <v-card-text>
                <v-form ref="searchForm">
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        label="Search IP, Domain"
                        v-model="searchQuery"
                        placeholder="8.8.8.8, example.com"
                        solo
                        :dark="isDarkMode"
                        :light="!isDarkMode"
                        clearable
                        append-icon="mdi-magnify"
                        :rules="searchRules"
                        :disabled="loading"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-btn
                        color="primary"
                        block
                        @click="validateAndScan('search', 'searchForm')"
                        :loading="loading"
                        :disabled="loading"
                      >
                        Analyze
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
                <p v-if="errorMessage" class="red--text text-center mt-2">
                  {{ errorMessage }}
                </p>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>

          <!-- Loading Indicator -->
          <v-card-text v-if="loading" class="text-center">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p class="mt-2" :class="isDarkMode ? 'white--text' : 'black--text'">Analyzing...</p>
          </v-card-text>

          <!-- Scan Report -->
          <scan-report :report="scanReport" v-if="scanReport" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ScanReport from './ScanReport.vue';

export default {
  name: 'HomeLanding',
  components: { ScanReport },
  props: { isDarkMode: { type: Boolean, default: false } },
  data() {
    return {
      tab: 'tab-url',
      url: '',
      file: null,
      searchQuery: '',
      loading: false,
      scanReport: null,
      errorMessage: null,
      urlRules: [
        v => !!v || 'URL is required',
        v =>
          /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(v) || 'Enter a valid URL',
      ],
      fileRules: [v => !!v || 'Please select a file'],
      searchRules: [
        v => !!v || 'Please enter an IP or domain',
        v => {
          const ipv4Regex =
            /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
          const domainRegex = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)\.[A-Za-z]{2,}$/;
          return (
            ipv4Regex.test(v) || domainRegex.test(v) || 'Please enter a valid IP or domain'
          );
        },
      ],
    };
  },
  watch: {
    tab() {
      this.scanReport = null;
      this.errorMessage = null;
      this.url = '';
      this.file = null;
      this.searchQuery = '';
    },
  },
  methods: {
    validateAndScan(type, formRef) {
      this.errorMessage = null;
      if (this.$refs[formRef].validate()) {
        this.submitScan(type);
      }
    },
    async submitScan(type) {
      if (type === 'url' && !this.url) return;
      if (type === 'search' && !this.searchQuery) return;
      if (type === 'file' && !this.file) return;

      this.loading = true;
      this.scanReport = null;
      this.errorMessage = null;

      try {
        let response;
        if (type === 'url') {
          response = await this.$axios.post('/scan/url', { url: this.url });
        } else if (type === 'search') {
          response = await this.$axios.post('/scan/search', { query: this.searchQuery });
        } else if (type === 'file') {
          const formData = new FormData();
          formData.append('file', this.file);
          response = await this.$axios.post('/scan/file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          this.file = null; // Clear file input after scan
        }

        // Handle malicious and suspicious counts together and provide detailed scans sorting
        const stats = response.data.last_analysis_stats || {};
        const maliciousCount = stats.malicious || 0;
        const suspiciousCount = stats.suspicious || 0;
        const totalThreats = maliciousCount + suspiciousCount;

        if (totalThreats > 0) {
          this.errorMessage = `Warning: ${totalThreats} engines detected threats (${maliciousCount} malicious, ${suspiciousCount} suspicious).`;
        } else {
          this.errorMessage = null;
        }

        // Sort scans so malicious and suspicious are on top
        if (response.data.scans) {
          const scansArray = Object.entries(response.data.scans).map(([engine, result]) => ({
            engine,
            ...result,
          }));

          scansArray.sort((a, b) => {
            const severity = { malicious: 3, suspicious: 2, undetected: 1, harmless: 0 };
            return severity[b.category] - severity[a.category];
          });

          response.data.sortedScans = scansArray;
        }

        this.scanReport = response.data;
      } catch (error) {
        console.error('API call failed:', error);
        this.errorMessage = 'Scan request failed, please try again.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
