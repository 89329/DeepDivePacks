document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.querySelector(".gallery");

    for (let i = 0; i < 15; i++) {
        let div = document.createElement("div");
        gallery.appendChild(div);
    }
});
