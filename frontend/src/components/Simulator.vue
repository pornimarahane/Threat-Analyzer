<template>
  <div>
    <SimulatorHome v-if="!scenarioChosen" @scenario-selected="startScenario" />
    <SimulatorTerminal
   v-else
     :scenarioType="scenarioType"
      @exit="resetSimulator" />
  </div>
</template>
<script>
import SimulatorHome from './SimulatorHome.vue';
import SimulatorTerminal from './SimulatorTerminal.vue';
export default {
  name: 'Simulator',
  components: { SimulatorHome, SimulatorTerminal },
  data() {
    return {
      scenarioType: null,
      scenarioChosen: false,
    };
  },
  methods: {
    startScenario(type) {
      this.scenarioType = type;
      this.scenarioChosen = true;
    },
    resetSimulator() {
      this.scenarioType = null;
      this.scenarioChosen = false;
    },
  },
};
</script>
