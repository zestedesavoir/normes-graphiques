<template>
  <section class="radius">
    <div
      v-for="(rad, i) in radius"
      :key="i"
      :class="{ 'is-round': rad.is_round }"
    >
      <article
        class="radius-preview style-item"
        :style="{ 'border-radius': rad.css }"
      >
        <h2>
          <div>
            Courbure {{ rad.is_round ? 'circulaire' : rad.id }}
            <code>{{ rad.variable }}</code>
          </div>
          <Copy
            :copy="rad.variable"
            label="Copier le code SCSS"
          />
        </h2>
        <pre>border-radius: {{ rad.css }};</pre>
      </article>
    </div>
  </section>
</template>

<script>
import Copy from './Copy.vue'

export default {
  data () {
    return {
      radius_raw: `
      $radius-1: .4rem;
      $radius-2: .6rem;
      $radius-3: .8rem;
      $radius-4: 1.2rem;
      $radius-5: 1.6rem;
      $radius-round: 19042014px;
      `
    }
  },
  computed: {
    radius () {
      return this.radius_raw
        .split('\n')
        .map(r => r.trim())
        .filter(r => !!r)
        .map(r => r.split(':'))
        .map(r => { return { variable: r[0].trim(), css: r[1].trim().replace(';', '') } })
        .map(r => { return { ...r, id: r.variable.replace('$radius-', '') } })
        .map(r => { return { ...r, is_round: r.id === 'round' } })
    }
  },
  components: {
    Copy
  }
}
</script>

<style lang="sass">
@import "~bulma/sass/utilities/mixins"

.radius
  display: flex
  flex-wrap: wrap

  > div
    display: flex
    width: calc(50% - 2rem)

    @include mobile
      width: calc(100% - 2rem)

    .radius-preview
      width: 100%
      border-color: #999

    &.is-round
      justify-content: center

      .radius-preview
        width: 21rem
        height: 21rem

        h2
          flex-direction: column
          align-items: center
          height: 42%

          div
            padding-top: 1rem
            text-align: center
</style>
