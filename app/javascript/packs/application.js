// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.

require("@rails/ujs").start()
require("turbolinks").start()
require("@rails/activestorage").start()
require("channels")
require("jquery")

// Uncomment to copy all static images under ../images to the output folder and reference
// them with the image_pack_tag helper in views (e.g <%= image_pack_tag 'rails.png' %>)
// or the `imagePath` JavaScript helper below.
//
// const images = require.context('../images', true)
// const imagePath = (name) => images(name, true)
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".chat")) {
    window.chat = new Chat();
  }
});

class Chat {
  constructor() {
    this.channel = null;
    this.client = null;
    this.identity = null;
    this.messages = ["Connecting..."];
    this.initialize();
  }

  initialize() {
    this.renderMessages();
    $.ajax({
      url: "/tokens",
      type: "POST",
      success: data => {
        this.identity = data.identity;

        Twilio.Chat.Client
          .create(data.token)
          .then(client => this.setupClient(client));
      }
    });
  }

  joinChannel() {
    if (this.channel.state.status !== "joined") {
      this.channel.join().then(function(channel) {
        console.log("Joined General Channel");
       });
    }
  }

  setupChannel(channel) {
    this.channel = channel;
    this.joinChannel();
    this.addMessage({ body: `Joined general channel as ${this.identity}` });
    this.channel.on("messageAdded", message => this.addMessage(message));
    this.setupForm();
  }

  setupClient(client) {
    this.client = client;
    this.client.getChannelByUniqueName("general")
      .then((channel) => this.setupChannel(channel))
      .catch((error) => {
        this.client.createChannel({
          uniqueName: "general",
          friendlyName: "General Chat Channel",
          isPrivate: true
        }).then((channel) => this.setupChannel(channel));
      });
  }
  renderMessages() {
    let messageContainer = document.querySelector(".chat .messages");
    messageContainer.innerHTML = this.messages
      .map(message => `<div class="message">${message}</div>`)
      .join("");
  }

  addMessage(message) {
    let html = "";

    if (message.author) {
      const className = message.author == this.identity ? "user me" : "user";
      html += `<span class="${className}">${message.author}: </span>`;
    }

    html += message.body;
    this.messages.push(html);
    this.renderMessages();
  }
  setupForm() {
    const form = document.querySelector(".chat form");
    const input = document.querySelector(".chat form input");

    form.addEventListener("submit", event => {
      event.preventDefault();
      this.channel.sendMessage(input.value);
      input.value = "";
      return false;
    })
  };
};
