document.addEventListener('DOMContentLoaded' , () => {

    const searchInput = document.querySelector('.search');
    const galerias = document.querySelectorAll('.box-galeria');
    const searchButton = document.querySelector('.search-button');

    if (searchButton) {
        searchButton.addEventListener('click', (event) => {
            event.preventDefault();
            if (searchInput && galerias) {
                const searchTerm = searchInput.value.toLowerCase();
                galerias.forEach(galeria => {
                    const products = galeria.querySelectorAll('.box-products')
                    products.forEach(product => {
                        const productName = product.querySelector('.title-products').textContent.toLocaleLowerCase();
                        if (productName.includes(searchTerm)) {
                            product.style.visibility = 'visible';
                            product.style.position = 'static';
                        } else {
                            product.style.visibility = 'hidden';
                            product.style.position = 'absolute';
                        }
                    });
                });
            }
        });
    }

    const inputLogin = document.querySelectorAll('.input-login')
    inputLogin.forEach(input => {
        input.addEventListener('keyup', (event) => {
            if (event.target.value.length < 3) {
                event.target.style.outlineColor = '#ff6b6b'
            } else {
                event.target.style.outlineColor = '#28a745'
            }
        })
    })
});

$(function () {
    function getCart() {
        try { return JSON.parse(localStorage.getItem('cart') || '[]'); }
        catch (e) { return []; }
    }
    function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }

    function formatPrice(num) {
        return Number(num || 0).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    const showToast = (message) => {
        const $toast = $('#toast-message');
        if ($toast.length === 0) {
            console.warn("Elemento #toast-message não encontrado. O alert() foi removido");
            return;
        }
        $toast.text(message).fadeIn(400)
        setTimeout(() => {
            $toast.fadeOut(400);
        }, 3000);
    };

    function renderCart() {
        var $container = $('#cart-itens');
        if ($container.length === 0) return;
        var cart = getCart();
        $container.empty();
        if (!cart || cart.length === 0) {
            $('#empty-cart-message').removeClass('d-none');
            $('#subtotal-value').text(formatPrice(0));
            $('#total-value').text(formatPrice(0));
            $container.addClass('d-none')
            return;
        }
        $('#empty-cart-message').addClass('d-none')
        $container.removeClass('d-none')
        cart.forEach(function(item) {
            var line = item.price * item.qty;
            var $art = $(
                '<article class="product-cart d-flex align-items-start p-4 m-2" data-id="'+item.id+'">' + 
                    '<div class="box-cart d-flex align-items-center justify-content-between w-100">' + 
                        '<div class="d-flex align-items-center">' + 
                            '<img class="img-product-cart mx-2" src="'+item.img+'" alt="'+item.title+'">' + 
                        '<span>'+item.title+'</span>'+ 
                        '</div>' + 
                        '<div class="d-flex box-cart">' + 
                            '<div class="d-flex align-items-center box-input">' + 
                            '<button class="btn c-white btn-plus">+</button>' + 
                            '<input class="qty-input" type="number" min="1" value="'+item.qty+'">' + 
                            '<button class="btn c-white btn-minus">-</button>' + 
                        '</div>' + 
                        '<div class="d-flex align-items-center w-auto">' + 
                            '<span class="line-total"><strong>'+formatPrice(line)+'</strong></span>' + 
                        '</div>' + 
                        '<div class="d-flex align-items-center box-remove">' + 
                            '<a href="" class="text-danger remove-item">Remover</a>' + 
                        '</div></div></div></article>');
            $container.append($art);
        });
        bindCartEvents();
        updateTotals();
    }

    function updateTotals() {
        var cart = getCart();
        var subtotal = 0
        cart.forEach(function(i) { subtotal += i.price *i.qty; });
        $('#subtotal-value').text(formatPrice(subtotal));
        $('#total-value').text(formatPrice(subtotal));
    }

    const contCarrinho = document.querySelector('.numero-produtos');
    const comprarButton = document.querySelectorAll('.comprar-button');

    if (!localStorage.getItem('contador')) {
        localStorage.setItem('contador', 0);
    }
    cont = Number(localStorage.getItem('contador'));
    contCarrinho.textContent = cont

    if (comprarButton.id == 'comprar-on') {
        comprarButton.src = 'assets/imgs/icons/comprar-button-check.png'
    } else {
        comprarButton.src = 'assets/imgs/icons/comprar-button.png'
    }

    if (comprarButton && comprarButton.length) {
        comprarButton.forEach(img => {
            img.addEventListener('click', (event) => {
                event.preventDefault();
                if (img.src.includes('comprar-button.png')) {
                    cont++
                    localStorage.setItem('contador', cont);
                    contCarrinho.textContent = cont
                }
            });
        });
    }

    function menos1Cont () {
        cont--
        localStorage.setItem('contador', cont);
        contCarrinho.textContent = cont
    }

    function bindCartEvents() {
        $('.remove-item').off('click').on('click', function(e) {
            e.preventDefault();
            var id = $(this).closest('.product-cart').data('id');
            var cart = getCart().filter(function(it) { return it.id !== id; });
            saveCart(cart);
            renderCart();
            menos1Cont();
        });
        $('.qty-input').off('change').on('change', function() {
            var $inp = $(this);
            var qty = parseInt($inp.val(),10) || 1;
            if (qty < 1) qty = 1; $inp.val(qty);
            var id = $inp.closest('.product-cart').data('id');
            var cart = getCart().map(function(it) { if (it.id === id) it.qty = qty; return it; });
            saveCart(cart);
            var item = cart.find(function(it) {return it.id === id; });
            if (item) $inp.closest('.product-cart').find('.line-total').text(formatPrice(item.price * item.qty));
            updateTotals();
        });
        $('.btn-plus').off('click').on('click', function() {
            var $inp = $(this).siblings('.qty-input');
            $inp.val( (parseInt($inp.val(),10)||0) + 1 ).trigger('change');
        });
        $('.btn-minus').off('click').on('click', function() {
            var $inp = $(this).siblings('.qty-input');
            var cur = parseInt($inp.val(),10) || 1; if (cur>1) $inp.val(cur-1).trigger('change');
        });
    }

    $(document).on('click', '.comprar-button, .comprar-button-2', function(e) {
        e.preventDefault();
        var $product = $(this).closest('.box-products');
        var title = $product.find('.title-products').text().trim();
        var priceText = $product.find('.price').text().trim();
        var cleaned = (priceText || '').replace(/[^0-9,.-]+/g, '').replace('.', '').replace(',', '.');
        var price = parseFloat(cleaned) || 0;
        var img = $product.find('img').attr('src') || '';
        var id = $product.data('id') || title.replace(/\s+/g,'-').toLowerCase();
        var cart = getCart();
        var found = cart.find(function(it){ return it.id === id});
        if (found) found.qty = (found.qty || 1) + 1; else cart.push({id:id, title:title, price:price, img:img, qty:1});
        saveCart(cart);
        renderCart();
        showToast('Produto adicionado no Carrinho!');
    });

    function getFavorite() {
        try { return JSON.parse(localStorage.getItem('favorite') || '[]'); }
        catch (e) { return []; }
    }
    function saveFavorite(favorite) { localStorage.setItem('favorite', JSON.stringify(favorite)); }

    function bindFavoriteEvents() {
        $('.remove-favorite').off('click').on('click', function(e) {
            e.preventDefault();
            var id = $(this).closest('.box-products-favorite').data('id');
            var favorite = getFavorite().filter(function(it) { return   it.id !== id; });
            saveFavorite(favorite);
            renderFavorite();
        });
    }

    function renderFavorite() {
        var $container = $('#favorite-itens');
        if ($container.length === 0) return;
        var favorite = getFavorite();
        $container.empty();
        if (!favorite || favorite.length === 0) {
            $('#empty-favorite-message').removeClass('d-none');
            $container.addClass('d-none')
            return;
        }
        $('#empty-favorite-message').addClass('d-none')
        $container.removeClass('d-none')
        favorite.forEach(function(item) {
            var $art = $('<article class="box-products-favorite" data-id="'+item.id+'">' +
                '<div class="d-flex flex-column box-favorite">' +
                '<h3 class="title-products-favorite">'+item.title+'</h3>' +
                '<img class="img-products-favorite" src="'+item.img+'" alt="'+item.title+'">' +
                '<div class="box-text-favorite">' +
                '<p class="price-favorite">'+item.price+'</p>' +
                '<div>' +
                '<input class="comprar" id="comprar-'+item.id+'" type="button" value="Comprar">' +
                '<label class="box-comprar-button" for="comprar-'+item.id+'"><img class="comprar-button" src="assets/imgs/icons/comprar-button.png" alt="botão de comprar"></label>' +
                '<button class="favoriter-button"><img class="remove-favorite" src="assets/imgs/icons/favorite-button-remove.png" alt="botão de favoritar"></button>' +
                '</div></div></div></article>'
            );
            $container.append($art);
        });
        bindFavoriteEvents();
    }

    $(document).on('click', '.favorite-icon', function(e) {
        e.preventDefault();
        var $product = $(this).closest('.box-products');
        var title = $product.find('.title-products').text().trim();
        var priceText = $product.find('.price').text().trim();
        var cleaned = (priceText || '').replace(/[^0-9,.-]+/g, '').replace('.', '').replace(',', '.');
        var price = parseFloat(cleaned) || 0;
        var img = $product.find('img').attr('src') || '';
        var id = $product.data('id') || title.replace(/\s+/g,'-').toLowerCase();
        var favorite = getFavorite();
        var found = favorite.find(function(it){ return it.id === id});
        if (found) found.qty = (found.qty || 1) + 1; else favorite.push({id:id, title:title, price:price, img:img, qty:1});
        saveFavorite(favorite);
        renderFavorite();
        showToast('Produto adicionado em Favoritos!');
    });

    $('body').append('<div id="toast-message"></div>');
    renderCart();
    $('body').append('<div id="favorite-toast-message"></div>')
    renderFavorite();
})