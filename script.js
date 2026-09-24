/* =====================================================
   A&G SOLUTIONS
   MAIN JAVASCRIPT
===================================================== */


/* YEAR */

const year = document.getElementById("year");

if (year) {
    year.textContent = new Date().getFullYear();
}


/* =====================================================
   MENU
===================================================== */

const menuButton =
    document.getElementById("menuButton");

const closeButton =
    document.getElementById("closeButton");

const menuOverlay =
    document.getElementById("menuOverlay");


/* OPEN */

if (menuButton && menuOverlay) {

    menuButton.addEventListener("click", function () {

        menuOverlay.classList.add("active");

    });

}


/* CLOSE */

if (closeButton && menuOverlay) {

    closeButton.addEventListener("click", function () {

        menuOverlay.classList.remove("active");

    });

}


/* CLICK OUTSIDE */

if (menuOverlay) {

    menuOverlay.addEventListener("click", function (event) {

        if (event.target === menuOverlay) {

            menuOverlay.classList.remove("active");

        }

    });

}


/* ESCAPE */

document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        menuOverlay
    ) {

        menuOverlay.classList.remove("active");

    }

});


/* =====================================================
   INDEX PAGE CARDS
===================================================== */

const shopCard =
    document.getElementById("shopCard");

const storeCard =
    document.getElementById("storeCard");


if (shopCard) {

    shopCard.addEventListener("click", function () {

        window.location.href = "shop.html";

    });


    shopCard.addEventListener("keydown", function (event) {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            window.location.href = "shop.html";

        }

    });

}


if (storeCard) {

    storeCard.addEventListener("click", function () {

        window.location.href = "store.html";

    });


    storeCard.addEventListener("keydown", function (event) {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            window.location.href = "store.html";

        }

    });

}
