document.addEventListener('DOMContentLoaded', () => {

    // ============================================== //
    // =========== GENEL SITE FONKSİYONLARI =========== //
    // ============================================== //

    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                 const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            } else {
                window.location.href = 'index.html' + targetId;
            }
        });
    });

    // ============================================== //
    // ============ VERİTABANI (DATABASE) ============= //
    // ============================================== //

    async function fetchProducts() {
        try {
            const response = await fetch('urun-veritabani.json');
            if (!response.ok) {
                throw new Error('Veritabanı yüklenemedi!');
            }
            const data = await response.json();
            return data.products;
        } catch (error) {
            console.error(error);
            return [];
        }
    }


    // ============================================== //
    // ============ ÜRÜN FİLTRELEME SAYFASI =========== //
    // ============================================== //

    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        const checkboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
        const productCountSpan = document.getElementById('product-count-span');

        const renderProducts = (products) => {
            productGrid.innerHTML = '';
            products.forEach(product => {
                const productHTML = `
                    <div class="col-md-4 product-item" data-tur="${product.tur}" data-yas="${product.yas}" data-irk="${product.irk}" data-ozellik="${product.ozellik}" data-gramaj="${product.gramaj}" data-lezzet="${product.lezzet || ''}">
                        <a href="urun-detay.html?id=${product.id}" class="product-card-link">
                            <div class="product-card">
                                <div class="product-image-container">
                                    <img src="${product.image}" alt="${product.name}" class="product-image">
                                </div>
                                <div class="product-details">
                                    <h5 class="product-name">${product.name}</h5>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
                productGrid.innerHTML += productHTML;
            });
        };
        
        const applyFilters = (allProducts) => {
            const selectedFilters = {};
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    const group = checkbox.dataset.filterGroup;
                    const value = checkbox.value;
                    if (!selectedFilters[group]) {
                        selectedFilters[group] = [];
                    }
                    selectedFilters[group].push(value);
                }
            });

            const filteredProducts = allProducts.filter(product => {
                for (const group in selectedFilters) {
                    const productValues = product[group] ? product[group].split(' ') : [];
                    const filterValues = selectedFilters[group];
                    if (!filterValues.some(filterValue => productValues.includes(filterValue))) {
                        return false;
                    }
                }
                return true;
            });

            renderProducts(filteredProducts);
            productCountSpan.textContent = filteredProducts.length;
        };

        fetchProducts().then(allProducts => {
            renderProducts(allProducts);
            productCountSpan.textContent = allProducts.length;
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => applyFilters(allProducts));
            });
        });
    }

    // ============================================== //
    // ============== ÜRÜN DETAY SAYFASI ============== //
    // ============================================== //
    const productDetailPage = document.querySelector('.product-detail-page.cv-style');
    if (productDetailPage) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        fetchProducts().then(allProducts => {
            const productData = allProducts.find(p => p.id === productId);

            if (productData) {
                // DOM elementlerini seç
                const titleEl = document.querySelector('.cv-product-name');
                const descEl = document.querySelector('.cv-product-description');
                const mainImageEl = document.getElementById('mainImage');
                const thumbnailsContainer = document.getElementById('thumbnail-container');
                const tagsContainer = document.querySelector('#tags-section .expertise-tags');
                const barcodeContainer = document.querySelector('#barcode-section .contact-info');
                const icindekilerContainer = document.getElementById('icindekiler-section');
                const analizContainer = document.getElementById('analiz-section');
                const faydalarContainer = document.querySelector('#faydalar-section .certificate-list');
                
                // Bilgileri doldur
                titleEl.textContent = productData.name;
                descEl.textContent = productData.description;
                mainImageEl.src = productData.mainImage;
                mainImageEl.alt = productData.name;

                thumbnailsContainer.innerHTML = '';
                productData.thumbnails.forEach((src, index) => {
                    const img = document.createElement('img');
                    img.src = src;
                    img.alt = `${productData.name} Küçük Resim ${index + 1}`;
                    img.classList.add('thumbnail', 'zoomable-image');
                    if (index === 0) img.classList.add('active');
                    thumbnailsContainer.appendChild(img);
                });

                tagsContainer.innerHTML = '';
                productData.tags.forEach(tag => {
                    tagsContainer.innerHTML += `<span class="tag">${tag}</span>`;
                });
                
                barcodeContainer.innerHTML = '';
                for(const size in productData.barkod) {
                    barcodeContainer.innerHTML += `<p><i class="fa-solid fa-barcode"></i> <strong>${size.toUpperCase()}:</strong> ${productData.barkod[size]}</p>`;
                }
                
                icindekilerContainer.innerHTML = `
                    <h3 class="cv-section-title-icon">İçindekiler</h3>
                    <div class="divider-wrapper"><hr class="section-divider"><div class="divider-plus">+</div></div>
                `;
                for(const key in productData.icindekiler) {
                    icindekilerContainer.innerHTML += `
                     <div class="experience-item">
                         <div>
                             <h4>${key}</h4>
                             <p>${productData.icindekiler[key]}</p>
                         </div>
                     </div>`;
                }

                analizContainer.innerHTML = `
                    <h3 class="cv-section-title-icon">Analitik Bileşenler</h3>
                    <div class="divider-wrapper"><hr class="section-divider"><div class="divider-plus">+</div></div>
                `;
                for(const key in productData.analiz) {
                     analizContainer.innerHTML += `
                     <div class="experience-item">
                         <div><h4>${key}</h4></div>
                         <div><p>${productData.analiz[key]}</p></div>
                     </div>`;
                }

                faydalarContainer.innerHTML = '';
                productData.faydalar.forEach(fayda => {
                    faydalarContainer.innerHTML += `<li>${fayda}</li>`;
                });
                
                // Thumbnail ve Zoom eventlerini yeniden bağla
                setupImageGalleryAndZoom();
            }
        });
    }

    function setupImageGalleryAndZoom() {
         // --- RESİM GALERİSİ ---
        const mainImage = document.getElementById('mainImage');
        const thumbnails = document.querySelectorAll('.thumbnail');
        if(mainImage && thumbnails.length > 0) {
            thumbnails.forEach(thumbnail => {
                thumbnail.addEventListener('click', function() {
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    mainImage.src = this.src;
                });
            });
        }
        
        // --- RESİM ZOOM (LIGHTBOX) ---
        const lightbox = document.getElementById('imageLightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const imagesToZoom = document.querySelectorAll('.zoomable-image');
        const closeBtn = document.querySelector('.lightbox-close');

        imagesToZoom.forEach(image => {
            image.addEventListener('click', () => {
                lightbox.style.display = 'block';
                lightboxImg.src = image.src;
            });
        });

        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                lightbox.style.display = 'none';
            });
        }
        
        if(lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    lightbox.style.display = 'none';
                }
            });
        }
    }
    
    // Sayfa ilk yüklendiğinde galeriyi ve zoom'u kur
    setupImageGalleryAndZoom();
});




