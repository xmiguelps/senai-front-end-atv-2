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
    
    document.querySelectorAll('.favorite-icon').forEach(img => {
        img.addEventListener('click', (event) => {
            event.preventDefault();
            if (img.src.includes('favorite-button.png')) {
                img.src = 'assets/imgs/icons/favorite-button-hover.png'
            } else {
                img.src = 'assets/imgs/icons/favorite-button.png'
            }
        });
    });

    let cont = 0;
    const contCarrinho = document.querySelector('.numero-produtos');
    const comprarButton = document.querySelectorAll('.comprar-button');

    if (comprarButton && comprarButton.length) {
        comprarButton.forEach(img => {
            img.addEventListener('click', (event) => {
                event.preventDefault();
                if (img.src.includes('comprar-button.png')) {
                    img.src = 'assets/imgs/icons/comprar-button-check.png'
                    img.classList.remove('comprar-button')
                    img.classList.add('comprar-button-2')

                    cont++
                    if (contCarrinho) contCarrinho.innerText = `${cont}`
                } else {
                    img.src = 'assets/imgs/icons/comprar-button.png'
                    img.classList.remove('comprar-button-2')
                    img.classList.add('comprar-button')
                    cont--
                    if (contCarrinho) contCarrinho.innerText = `${cont}`
                }
            });
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
                '<article class="product-cart d-flex align-items-start p-4" data-id="'+item.id+'">' + 
                    '<div class="d-flex align-items-center justify-content-between w-100">' + 
                        '<div class="d-flex align-items-center">' + 
                            '<img class="img-product-cart mx-2" src="'+item.img+'" alt="'+item.title+'">' + 
                        '<span>'+item.title+'</span>'+ 
                        '</div>' + 
                        '<div class="d-flex">' + 
                            '<div class="d-flex align-items-center">' + 
                            '<button class="btn c-white btn-plus">+</button>' + 
                            '<input class="qty-input" type="number" min="1" value="'+item.qty+'">' + 
                            '<button class="btn c-white btn-minus">-</button>' + 
                        '</div>' + 
                        '<div class="d-flex align-items-center ms-5">' + 
                            '<span class="line-total"><strong>'+formatPrice(line)+'</strong></span>' + 
                        '</div>' + 
                        '<div class="d-flex align-items-center ms-3">' + 
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

    function bindCartEvents() {
        $('.remove-item').off('click').on('click', function(e) {
            e.preventDefault();
            var id = $(this).closest('.product-cart').data('id');
            var cart = getCart().filter(function(it) { return it.id !== id; });
            saveCart(cart);
            renderCart();
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
        showToast('Produto adicionado no carrinho!');
    });

    $('body').append('<div id="toast-message"></div>');
    renderCart();
})