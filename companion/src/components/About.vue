<template>
  <section class="about">
    <header>
      <img
        src="img/zestedesavoir.svg"
        alt="Zeste de Savoir"
      >
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
        <copy
          copy="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          button-before
        >
          Cliquez-moi !
        </copy>
      </p>
      <p>
        <b-button
          type="is-primary"
          tag="a"
          href="https://docs.zestedesavoir.com/front-end.html"
        >
          Retour à la documentation de Zeste de Savoir
        </b-button>
      </p>
    </article>

    <article class="box">
      <h3>Importer ces normes dans votre projet</h3>

      <p>
        Un paquet NPM <copy copy="zestedesavoir-standards"><code>zestedesavoir-standards</code></copy> est mis à disposition afin d'importer ces normes dans vos projets. Il expose les fichiers
        SASS contenant toutes les variables et <em>mixins</em> exposées sur ce site. Installez-le ainsi.
      </p>

      <pre>npm i zestedesavoir-standards</pre>

      <p>
        Ensuite, vous pouvez importer les variables et <em>mixins</em> SASS dans votre projet, là où vous en avez besoin.
      </p>

      <pre>@import "zestedesavoir-standards"</pre>

      <p>
        Ou bien n'importer que ce dont vous avez l'usage, bien sûr.
      </p>

      <pre>
@import "~zestedesavoir-standards/sass/colors"
@import "~zestedesavoir-standards/sass/typography"
@import "~zestedesavoir-standards/sass/lengths"
@import "~zestedesavoir-standards/sass/shadows"
@import "~zestedesavoir-standards/sass/radius"</pre>
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
@import "zestedesavoir-standards"

section.about
  header
    position: relative

    margin: 0
    padding: $length-20

    +touch
      margin: 0 $length-16

    border-radius: $radius-2

    background-color: $primary-600
    text-align: center

    img
      height: $length-48

    h2
      position: absolute
      top: 6rem
      left: 26rem

      +mobile
        position: relative
        top: -1.4rem
        left: auto

      font-size: $size-10
      font-family: "Source Code Pro", monospace, serif

      color: white

  article
    max-width: 52rem

    margin: auto
    padding: $length-16 $length-10

    p
      font-size: 1.08rem
      text-align: center

      &:not(:first-child)
        margin-top: $length-16

      .copy-button-container .b-tooltip.is-button-tooltip
        top: -1px
        margin-right: $length-4

      a.button
        margin-top: $length-32
        padding: $length-16

    &.box
      margin-top: $length-32
      margin-bottom: $length-16
      padding-top: $length-8

      h3
        font-weight: bold
        color: $primary-600

      p
        margin-top: $length-8
        text-align: left

        code
          font-size: $size-12
          font-weight: 500

      pre
        margin-top: $length-8
        border-radius: $radius-1
</style>
