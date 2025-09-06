<template>
  <!-- Main card for the scan report -->
  <v-card class="mt-5 rounded-lg" dark>
    <v-card-title class="pa-4">
      <span class="headline font-weight-bold">Scan Report</span>
      <v-spacer></v-spacer>
      <!-- A dynamic chip to show the verdict -->
      <v-chip :color="isMalicious ? 'red' : 'green'" class="font-weight-bold">
        {{ isMalicious ? 'Malicious' : 'Safe' }}
      </v-chip>
    </v-card-title>

    <v-divider></v-divider>

    <!-- The content to be converted to PDF -->
    <div id="report-content">
      <!-- Summary View -->
      <div v-if="!showFullReport">
        <v-card-text>
          <p class="mb-4 text-h6">
            <strong>Verdict:</strong> 
            <span :class="isMalicious ? 'red--text' : 'green--text'">
              {{ isMalicious ? 'Malicious' : 'Safe' }}
            </span>
          </p>

          <div class="d-flex align-center mt-6">
            <p class="mb-0 text-subtitle-1">Detection Results</p>
            <v-spacer></v-spacer>
            <p class="mb-0 text-right text-caption">{{ detectionPercentage }}% Detection Rate</p>
          </div>

          <v-progress-linear
            class="my-2 rounded"
            height="16"
            :value="detectionPercentage"
            :buffer-value="100"
            :color="isMalicious ? 'red' : 'green'"
          >
            <span class="text-xs font-weight-bold">{{ detectionPercentage }}%</span>
          </v-progress-linear>

          <v-row class="mt-4">
            <v-col cols="6" sm="3">
              <v-card class="pa-3 rounded-lg text-center" color="#2c2c2c">
                <div class="text-h5 font-weight-bold red--text">{{ maliciousCount }}</div>
                <div class="caption">Malicious</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="pa-3 rounded-lg text-center" color="#2c2c2c">
                <div class="text-h5 font-weight-bold orange--text">{{ suspiciousCount }}</div>
                <div class="caption">Suspicious</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="pa-3 rounded-lg text-center" color="#2c2c2c">
                <div class="text-h5 font-weight-bold green--text">{{ cleanCount }}</div>
                <div class="caption">Clean</div>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card class="pa-3 rounded-lg text-center" color="#2c2c2c">
                <div class="text-h5 font-weight-bold grey--text">{{ undetectedCount }}</div>
                <div class="caption">Undetected</div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </div>

      <!-- Full Report View (Table) -->
      <div v-else>
        <v-card-text>
          <p class="headline">Full Report Details</p>
          <v-simple-table dark class="rounded-lg">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left white--text text-subtitle-1">Engine</th>
                  <th class="text-left white--text text-subtitle-1">Result</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(scan, idx) in sortedScanResults" :key="scan.engine">
                  <td>{{ scan.engine }}</td>
                  <td :class="getResultColor(scan.result)">
                    {{ scan.result || 'Clean' }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </div>
    </div>

    <v-divider></v-divider>

    <!-- Toggle and Download buttons -->
    <v-card-actions class="justify-center">
      <v-btn
        color="primary"
        text
        @click="showFullReport = !showFullReport"
      >
        {{ showFullReport ? 'View Summary' : 'View Full Report' }}
      </v-btn>
      <v-btn
        color="info"
        text
        class="ml-2"
        @click="downloadReport"
      >
        <v-icon left>mdi-download</v-icon>
        Download Report (PDF)
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default {
  name: 'ScanReport',
  props: {
    report: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showFullReport: false,
    };
  },
  computed: {
    isMalicious() {
      return this.maliciousCount > 0;
    },
    totalEngines() {
      if (!this.report || !this.report.scans) return 0;
      return Object.keys(this.report.scans).length;
    },
    maliciousCount() {
      if (!this.report || !this.report.scans) return 0;
      return Object.values(this.report.scans).filter(s => s.category === 'malicious').length;
    },
    suspiciousCount() {
      if (!this.report || !this.report.scans) return 0;
      return Object.values(this.report.scans).filter(s => s.category === 'suspicious').length;
    },
    cleanCount() {
      if (!this.report || !this.report.scans) return 0;
      return Object.values(this.report.scans).filter(s =>
        s.category === 'harmless' || s.category === 'clean'
      ).length;
    },
    undetectedCount() {
      if (!this.report || !this.report.scans) return 0;
      return Object.values(this.report.scans).filter(s => s.category === 'undetected').length;
    },
    detectionPercentage() {
      if (!this.report || !this.report.scans || this.totalEngines === 0) return 0;
      return ((this.maliciousCount / this.totalEngines) * 100).toFixed(1);
    },
    // Sorted scan results with malicious/suspicious first
    sortedScanResults() {
      if (!this.report || !this.report.scans) return [];
      const arr = Object.entries(this.report.scans).map(([engine, result]) => ({
        engine,
        ...result,
      }));

      const priority = (scan) => {
        if (!scan.result) return 100;
        const r = scan.result.toLowerCase();
        if (
          r.includes('malicious') ||
          r.includes('trojan') ||
          r.includes('virus') ||
          r.includes('worm') ||
          r.includes('backdoor') ||
          r.includes('agent')
        ) return 1;
        if (r.includes('phishing')) return 2;
        if (r.includes('suspicious')) return 3;
        if (r.includes('unrated')) return 99;
        if (r.includes('clean')) return 50;
        return 100;
      };

      return arr.sort((a, b) => priority(a) - priority(b));
    },
  },
  methods: {
    getResultColor(result) {
      if (!result) {
        return 'green--text'; // clean
      }
      const lowerResult = result.toLowerCase();
      if (
        lowerResult.includes('trojan') ||
        lowerResult.includes('virus') ||
        lowerResult.includes('worm') ||
        lowerResult.includes('malware') ||
        lowerResult.includes('backdoor') ||
        lowerResult.includes('agent')
      ) {
        return 'red--text'; // malicious detection
      } else if (lowerResult.includes('phishing')) {
        return 'red--text'; // phishing also red
      } else if (lowerResult.includes('suspicious')) {
        return 'orange--text';
      } else if (lowerResult.includes('clean')) {
        return 'green--text';
      } else if (lowerResult.includes('undetected')) {
        return 'grey--text';
      }
      return 'grey--text';
    },
    async downloadReport() {
      const reportElement = document.getElementById('report-content');

      if (!reportElement) {
        console.error('Report element not found!');
        return;
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#1E1E1E'
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const imgWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save('scan-report.pdf');
    }
  }
};
</script>
