<template>  
    <div class="content d-flex flex-column fill-height justify-center align-center">
      <h1 class="text-h4 font-weight-thin mb-4">
        Welcome to NovelDocs
      </h1>
      <h4 class="subheading text-center">
        Your Ultimate Writing Companion
      </h4>
      <router-link to="/projects">
        <v-btn color="primary" class="get-started-button">Get started</v-btn>
      </router-link>
      <div class="pitch">
          <p>Unleash your creativity and streamline your writing process with NovelDocs, the unique platform designed to help novel writers keep their ideas organized and their stories flowing.</p>
          <p>With NovelDocs, you can easily manage and access your novel's critical elements – characters, locations, chapters, and scenes – from a centralized location. Our intuitive interface ensures you'll never lose track of a brilliant idea again.</p>
          <p>Our innovative platform allows you to write your novel directly in a Google Docs embeded editor, providing the familiarity and robust features of Google's powerful word processing tool while adding a layer of advanced organizational capabilities tailored specifically for novel writing.</p>
          <p>But the best part? All your creative work remains completely private. Your novel is saved in a unique structure within your personal Google Drive, and no information is stored outside of it. You maintain full control and ownership of your work at all times.</p>
          <p>Take the first step towards your writing journey with NovelDocs. Let us be the backbone of your next masterpiece. Start a project today, and bring your story to life.</p>
      </div>
      <router-link to="/projects">
        <v-btn color="primary" class="get-started-button">Get started</v-btn>
      </router-link>
    </div>
</template>

<script>
</script>

<style scoped>
.content {
    margin: 30px auto;
}
.pitch {
    width: 60%;
    margin: 30px auto;
    text-align: justify;
}
p {
  margin-top: 20px;
  margin-bottom: 20px;
}

.get-started-button {
  margin: 20px;
}
a, a:visited, a:hover {
  all: unset;
}
</style>
