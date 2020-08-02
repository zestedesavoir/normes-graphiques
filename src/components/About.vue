<template>
  <section class="about">
    <header>
      <img src="img/logo.svg" alt="Zeste de Savoir" />
      <h2>Compagnon d'interface</h2>
    </header>

    <article>
      <p>
        Ce site permet de récupérer facilement les valeurs standardisées utilisées dans le cadre du développement de
        l'interface de <a href="https://zestedesavoir.com">Zeste de Savoir</a>.
      </p>
      <p>
        Vous pouvez copier facilement les valeurs des différents éléments (généralement les variables ou <em>mixin</em>
        SCSS directement prêtes à l'emploi) en cliquant sur les couleurs ou sur cette icône.
      </p>
      <p>
        <copy copy="https://www.youtube.com/watch?v=dQw4w9WgXcQ" button-before>Cliquez-moi !</copy>
      </p>
      <p>
        <b-button type="is-primary" tag="a" href="https://docs.zestedesavoir.com/front-end.html">
          Retour à la documentation de Zeste de Savoir
        </b-button>
      </p>
    </article>
  </section>
</template>

<script>
import Copy from './Copy.vue'

export default {
  components: {
    Copy
  }
}
</script>

<style lang="sass">
@import "bulma/sass/utilities/mixins"

section.about
  header
    position: relative

    margin: 0

    +touch
      margin: 0 1.5rem

    border-radius: 6px

    background-color: hsl(199, 62.1%, 25.9%)
    text-align: center

    img
      height: 8rem

    h2
      position: absolute
      top: 5rem
      left: 26rem

      +mobile
        position: relative
        top: -1.4rem
        left: auto

      font-size: 1.4rem
      font-family: "Source Code Pro", monospace, serif

      color: white

  article
    max-width: 52rem

    margin: auto
    padding: 1.5rem 1rem

    p
      font-size: 1.08rem
      text-align: center

      &:not(:first-child)
        margin-top: 1.5rem

      .copy-button-container .b-tooltip.is-button-tooltip
        top: -1px
        margin-right: .4rem

      a.button
        margin-top: 3rem
        padding: 1.5rem
</style>
