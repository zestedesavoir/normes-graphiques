<template>
  <section class="fonts">
    <section class="font-families">
      <article
        v-for="(font, i) in fonts"
        :key="i"
        @mouseenter="change_selected_font(font.fonts)"
        @click="change_selected_font(font.fonts)"
        class="style-item"
        :class="{ 'is-active': font.fonts === active_font}"
      >
        <h2>
          <div>
            {{ font.main_font }}
            <code>{{ font.variable }}</code>
          </div>
          <Copy
            :copy="font.variable"
            label="Copier la variable"
          />
        </h2>
        <p :style="{ fontFamily: font.fonts }">
          {{ pangramme }}
        </p>
      </article>
    </section>

    <section class="font-sizes">
      <ul>
        <li
          v-for="(size, i) in sizes"
          :key="i"
        >
          <p>
            <Copy
              :copy="size.variable"
              label="Copier la variable"
              button-before
            >
              <code>{{ size.variable }}</code>
            </Copy>
          </p>
          <p class="size">
            {{ size.size.replace('rem', ' rem') }}
          </p>
          <p
            class="preview"
            :style="{ 'font-size': `${size.number}em`, 'line-height': `${size.number}rem`, 'font-family': active_font }"
          >
            {{ pangramme }}
          </p>
        </li>
      </ul>
    </section>
  </section>
</template>

<script>
import Copy from './Copy.vue'

export default {
  data () {
    return {
      pangramme: 'Voix ambiguë d\'un cœur qui, au zéphyr caressant le grauwacke, préfère une jatte de smoothies.',
      active_font: '',
      sass_typography: require('./../../../standards/sass/typography.sass').default
    }
  },
  computed: {
    fonts () {
      return this.sass_typography
        .split('\n')
        .map(line => line.trim())
        .filter(line => !!line)
        .filter(line => line.startsWith('$font-') && !line.startsWith('$font-size-'))
        .map(line => line.split(':', 2))
        .map(l => { return { variable: l[0].trim(), fonts: l[1].trim().replace(';', ''), main_font: l[1].trim().split(',', 2)[0].replace(/^"|"$/g, '') } })
    },

    sizes () {
      return this.sass_typography
        .split('\n')
        .map(line => line.trim())
        .filter(line => !!line)
        .filter(line => line.startsWith('$font-size-'))
        .map(line => line.split(':', 2))
        .map(l => { return { variable: l[0].trim(), size: l[1].trim().replace(';', ''), number: parseFloat(l[1]) } })
        .sort((a, b) => parseInt((a.number - b.number) * 1000))
    }
  },
  methods: {
    change_selected_font (font) {
      this.active_font = font
    }
  },
  mounted () {
    this.active_font = this.fonts[0].fonts
  },
  components: {
    Copy
  }
}
</script>

<style lang="sass">
@import "bulma/sass/utilities/mixins"
@import "zestedesavoir-standards"

// sorry
@import url("https://fonts.googleapis.com/css2?family=Merriweather&family=Source+Code+Pro&family=Source+Sans+Pro&display=swap&text=Voix%20ambigu%C3%AB%20d%27un%20c%C5%93ur%20qui%2C%20au%20z%C3%A9phyr%20caressant%20le%20grauwacke%2C%20pr%C3%A9f%C3%A8re%20une%20jatte%20de%20smoothies.")

.fonts
  .font-families
    display: flex

    @include mobile
      flex-direction: column

    .style-item
      flex: 1

  .font-sizes
    margin: $length-24 $length-10 $length-10 $length-10

    ul
      li
        display: flex
        align-items: first baseline

        position: relative

        // Emulates base font size in ZdS
        font-size: 10px

        &:not(:last-child)
          padding-bottom: $length-4
          border-bottom: $length-1 solid $grey-100
          margin-bottom: $length-4

        &:after
          content: ''
          position: absolute
          top: 0
          right: 0
          width: $length-96
          height: 200%
          background: linear-gradient(90deg, transparent 0%, transparent 50%, white 100%)

        p
          font-size: 1.8em
          position: relative

          &:not(.preview)
            width: $length-96

          &.size
            position: relative
            top: -2px

            padding-right: $length-32

            font-family: 'Fira Code', monospace
            font-weight: bold
            font-size: 1.04rem
            text-align: right

            color: $grey-500

          code
            padding: 0 0 0 $length-4

          svg.copy-button
            height: .9em

        p.preview
          overflow: hidden
          white-space: nowrap

          position: relative

          width: calc(100% - 16rem)

          color: $grey-800
</style>
