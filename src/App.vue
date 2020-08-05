''<template>
  <div id="app">
    <div class="container">
      <b-tabs
        position="is-centered"
        :animated="false"
        v-model="currentTab"
      >
        <b-tab-item label="À propos">
          <About />
        </b-tab-item>

        <b-tab-item label="Couleurs">
          <Colors />
        </b-tab-item>

        <b-tab-item label="Polices">
          <Fonts />
        </b-tab-item>

        <b-tab-item label="Longueurs">
          <Lengths />
        </b-tab-item>

        <b-tab-item label="Ombres">
          <Shadows />
        </b-tab-item>

        <b-tab-item label="Arrondis">
          <Radius />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import About from './components/About.vue'
import Colors from './components/Colors.vue'
import Fonts from './components/Fonts.vue'
import Lengths from './components/Lengths.vue'
import Shadows from './components/Shadows.vue'
import Radius from './components/Radius.vue'

export default {
  name: 'App',
  data () {
    return {
      currentTab: 0
    }
  },
  methods: {
    updateHash () {
      if (this.currentTab === 0) {
        document.location.hash = ''

        // Removes the # at the end of the URL
        history.replaceState('', document.title, window.location.pathname + window.location.search)
        return
      }

      setTimeout(() => {
        const tabEl = document.querySelector(`.b-tabs nav.tabs li:nth-child(${this.currentTab + 1}) a`)
        document.location.hash = tabEl.innerText.toLowerCase()
      }, 100)
    }
  },
  mounted () {
    if (document.location.hash !== '') {
      setTimeout(() => {
        let i = 0
        let found = false

        document.querySelectorAll('.b-tabs nav.tabs li').forEach(e => {
          if (found) return

          if (e.querySelector('a').innerText.toLowerCase() === document.location.hash.toLowerCase().substring(1)) {
            found = true
            this.currentTab = i
          }

          i++
        })
      }, 100)
    } else {
      this.currentTab = parseInt(localStorage.getItem('current-tab') || 0)
      this.updateHash(true)
    }
  },
  watch: {
    currentTab () {
      localStorage.setItem('current-tab', this.currentTab)
      this.updateHash(false)
    }
  },
  components: {
    About,
    Colors,
    Fonts,
    Lengths,
    Shadows,
    Radius
  }
}
</script>

<style lang="scss">
@import "~bulma/sass/utilities/_all";

$primary: hsl(199, 85%, 21%);
$primary-invert: findColorInvert($primary);

$colors: (
"white": ($white, $black),
"black": ($black, $white),
"light": ($light, $light-invert),
"dark": ($dark, $dark-invert),
"primary": ($primary, $primary-invert),
"info": ($info, $info-invert),
"success": ($success, $success-invert),
"warning": ($warning, $warning-invert),
"danger": ($danger, $danger-invert),
);

// Links
$link: $primary;
$link-invert: $primary-invert;
$link-focus-border: $primary;

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

body {
  font-family: 'Fira Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI',
               Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
               'Segoe UI Emoji', 'Segoe UI Symbol';

  padding: 0;
  padding-top: 1.5rem;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  .container {
    max-width: 1024px;
  }

  .b-tabs .tab-content {
    padding: 1.5rem 0 0 0;

    @include mobile {
      padding: 1.5rem .5rem .5rem;
    }
  }

  code {
    font-size: .8em;
    font-family: 'Fira Code', monospace;
    font-weight: bold;

    color: #888;
    background-color: transparent;
  }
}

@import 'assets/style-items.sass'
</style>
