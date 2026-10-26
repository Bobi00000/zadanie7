/*jslint browser */
(function () {
    "use strict";

    const gallery = document.querySelector("[data-gallery]");
    if (!gallery) {
        return;
    }

    const viewport = gallery.querySelector("[data-viewport]");
    const track = gallery.querySelector("[data-track]");
    const slides = Array.from(track.children);
    const prevButton = gallery.querySelector("[data-prev]");
    const nextButton = gallery.querySelector("[data-next]");
    const currentLabel = gallery.querySelector("[data-current]");
    const totalLabel = gallery.querySelector("[data-total]");
    const dotsList = gallery.querySelector("[data-dots]");
    // Тот же порог, что и в style.css: до 37.5em показывается одно изображение
    const phoneQuery = window.matchMedia("(max-width: 37.5em)");
    const swipeDistance = 50;

    let perView = 0;
    let firstVisible = 0;
    let dots = [];
    let swipeStartX = null;

    function maxFirstVisible() {
        return Math.max(0, slides.length - perView);
    }

    function pageCount() {
        return Math.ceil(slides.length / perView);
    }

    function currentPage() {
        if (firstVisible >= maxFirstVisible()) {
            return pageCount() - 1;
        }
        return Math.floor(firstVisible / perView);
    }

    function render() {
        const page = currentPage();
        const lastPage = pageCount() - 1;

        const shift = (firstVisible * 100) / perView;

        track.style.transform = "translateX(-" + shift + "%)";
        slides.forEach(function (slide, index) {
            const visible = index >= firstVisible && index < firstVisible + perView;
            slide.setAttribute("aria-hidden", String(!visible));
        });

        currentLabel.textContent = String(page + 1);
        totalLabel.textContent = String(lastPage + 1);
        prevButton.disabled = page === 0;
        nextButton.disabled = page === lastPage;

        dots.forEach(function (dot, index) {
            if (index === page) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function goToPage(page) {
        const lastPage = pageCount() - 1;
        const target = Math.min(Math.max(page, 0), lastPage);

        // Последняя страница не выходит за край: показывает последние изображения
        firstVisible = Math.min(target * perView, maxFirstVisible());
        render();
    }

    function buildDots() {
        dotsList.textContent = "";
        dots = [];
        let index = 0;
        while (index < pageCount()) {
            const pageIndex = index;
            const item = document.createElement("li");
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "gallery__dot";
            dot.setAttribute("aria-label", "Страница " + (pageIndex + 1));
            dot.addEventListener("click", function () {
                goToPage(pageIndex);
            });
            item.appendChild(dot);
            dotsList.appendChild(item);
            dots.push(dot);
            index += 1;
        }
    }

    function updateLayout() {
        const newPerView = (
            phoneQuery.matches
            ? 1
            : 3
        );
        if (newPerView === perView) {
            return;
        }
        perView = newPerView;
        firstVisible = Math.min(firstVisible, maxFirstVisible());
        buildDots();
        render();
    }

    prevButton.addEventListener("click", function () {
        goToPage(currentPage() - 1);
    });

    nextButton.addEventListener("click", function () {
        goToPage(currentPage() + 1);
    });

    gallery.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") {
            goToPage(currentPage() - 1);
        } else if (event.key === "ArrowRight") {
            goToPage(currentPage() + 1);
        }
    });

    viewport.addEventListener("pointerdown", function (event) {
        swipeStartX = event.clientX;
    });

    viewport.addEventListener("pointerup", function (event) {
        if (swipeStartX === null) {
            return;
        }
        const distance = event.clientX - swipeStartX;
        swipeStartX = null;
        if (distance <= -swipeDistance) {
            goToPage(currentPage() + 1);
        } else if (distance >= swipeDistance) {
            goToPage(currentPage() - 1);
        }
    });

    viewport.addEventListener("pointercancel", function () {
        swipeStartX = null;
    });

    phoneQuery.addEventListener("change", updateLayout);
    updateLayout();
}());
