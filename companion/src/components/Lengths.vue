<template>
  <section class="lengths">
    <ul>
      <li
        v-for="(length, i) in lengths"
        :key="i"
      >
        <copy
          :copy="length.variable"
          button-before
          label="Copier la variable"
        >
          <code>{{ length.variable }}</code>
        </copy>

        <p class="size">
          {{ length.css.replace('rem', ' rem') }}
        </p>

        <div
          class="length-preview"
          :style="{ width: length.css }"
        />
      </li>
    </ul>
  </section>
</template>

<script>
import Copy from './Copy.vue'

export default {
  data () {
    return {
      sass_lengths: require('./../../../standards/sass/lengths.sass').default
    }
  },
  computed: {
    lengths () {
      return this.sass_lengths
        .split('\n')
        .map(l => l.trim())
        .filter(l => !!l)
        .map(l => l.split(':'))
        .map(l => { return { variable: l[0].trim(), css: l[1].trim().replace(';', '') } })
    }
  },
  components: {
    Copy
  }
}
</script>

<style lang="sass">
.lengths
  ul li
    display: flex
    align-items: first baseline

    // Emulates base font size in ZdS
    font-size: 10px

    margin-bottom: .6rem

    &:after
      content: ''
      position: absolute
      top: 0
      right: 0
      width: 4rem
      height: 200%
      background: linear-gradient(90deg, transparent 0%, transparent 50%, white 100%)

    .copy-button-container
      width: 8.6rem
      min-width: 8.6rem

      //font-family: 'Fira Code', monospace
      font-weight: bold
      font-size: 1.1rem
      text-align: right
      color: #666

      code
        padding: 0 0 0 .4rem

      svg.copy-button
        height: .9em

        path
          color: #999

    .size
      //font-size: 1.8em
      width: 5rem
      min-width: 5rem
      position: relative
      top: -4px

      padding-right: 1rem
      font-family: 'Fira Code', monospace
      font-weight: bold
      font-size: 1.2em
      text-align: right
      color: #666

    .length-preview
      position: relative
      top: .1rem

      height: 1.2rem
      background-color: hsl(199, 85%, 21%)
</style>
