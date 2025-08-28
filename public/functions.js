if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var revmoveCartItemButton = document.getElementsByClassName('btn-remove')
    for (var i = 0; i < revmoveCartItemButton.length; i++) {
        var button = revmoveCartItemButton[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-btn')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)

    updateCartTotal()
}

var stripeHandler = StripeCheckout.configure({
    key: stripePublicKey,
    locale: 'en',
    token: function(token) {
        var items = []
        var cartItemConatiner = document.getElementsByClassName('cart-items')[0]
        var cartRows = cartItemConatiner.getElementsByClassName('cart-row')
        for (var i = 0; i < cartRows.length; i++) {
            var carRow = cartRows[i]
            var quantityElement = document.getElementsByClassName('cart-quantity-input')[0]
            var quantity = quantityElement.value
            var id = carRow.dataset.itemId
            items.push({
                id: id,
                quantity: quantity
            })
        }

        fetch('/purchase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'applications/son'
            },
            body: JSON.stringify({
                stripeTokenId: token.id,
                items: items
            })
        }).then(function(res) {
            return res.json()
        }).then(function(data) {
            alert(data.message)
            var cartItems = document.getElementsByClassName('cart-items')[0]
            while (cartItems.hasChildNodes()) {
                cartItems.removeChild(cartItems.firstChild)
            }
            updateCartTotal()
        }).catch(function(error) {
            console.log(error)
        })
        
    }
})

function purchaseClicked() {
    // alert('Thank you for your purchase!')
    var priceElement = document.getElementsByClassName('cart-total-price')[0]
    var price = parseFloat(priceElement.innerText.replace('$', '')) * 100
    stripeHandler.open({
        amount: price
    })
}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }

    updateCartTotal()
}

function addToCartClicked(event) {
    var button = event.target
    var shopItem = button.parentElement
    var title = shopItem.getElementsByClassName('product-title')[0].innerText
    var price = shopItem.getElementsByClassName('product-price')[0].innerText
    var imageSRC = shopItem.getElementsByClassName('product-img')[0].src
    var id = shopItem.dataset.itemId
    addItemToCart(title, price, imageSRC, id) 
    updateCartTotal()
}

function addItemToCart(title,price, imageSRC, id) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    cartRow.dataset.itemId = id
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (i = 0; i < cartItemNames.length; i++){
        if (cartItemNames[i].innerText == title) {
            alert('This item is already in cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-collumn">
            <img class="cart-item-image" src="${imageSRC}" alt="cart cookie" width="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-collumn">${price}</span>
        <div class="cart-quantity cart-collumn quantity-fix">
            <input class="cart-quantity-input" type="number" value="1"> 
            <button class="btn btn-remove btn-style" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-remove')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged)
}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var QuantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = parseInt(QuantityElement.value)
        total = total + (quantity * price)
    }
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}

// const btn = document.querySelector('button');
// console.log(btn)

// btn.onclick = () => {
//     alert('added to cart');
// }

// document.getElementById("cookyheader").textContent = `Our Cookies`;

// window.alert(`I like pizza!`)