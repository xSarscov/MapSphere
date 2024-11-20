import { initProject } from "./src/app";

document.addEventListener('DOMContentLoaded', () => {
    // initProject();
    document.querySelector("#app").innerHTML = `
    
        <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="container-fluid container-xl position-relative d-flex align-items-center">

      <a href="index.html" class="logo d-flex align-items-center me-auto">
        <!-- Uncomment the line below if you also wish to use an image logo -->
        <!-- <img src="assets/img/logo.png" alt=""> -->
        <h1 class="sitename">MapSphere</h1>
      </a>

      


    </div>
  </header>

  <main class="main">

    <!-- Hero Section -->
    <section id="hero" class="hero section dark-background">

      <img src="assets/img/world-dotted-map.png" alt="" class="hero-bg" data-aos="fade-in">

      <div class="container">
        <div class="row gy-4 d-flex justify-content-between">
          <div class="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
            <h2 data-aos="fade-up">Discover Smarter Navigation Solutions</h2>
            <p data-aos="fade-up" data-aos-delay="100">Revolutionize the way you explore and connect. Our cutting-edge mapping and navigation platform delivers precision, speed, and an intuitive experience. Whether you're planning a journey or discovering new destinations, let us guide your way.</p>

           

            

          </div>

          <div class="col-lg-5 order-1 order-lg-2 hero-img" data-aos="zoom-out">
            <img src="assets/img/hero-img.svg" class="img-fluid mb-3 mb-lg-0" alt="">
          </div>

        </div>
      </div>

    </section><!-- /Hero Section -->

    <!-- Featured Services Section -->
    <section id="featured-services" class="featured-services section">

      <div class="container">

        <div class="row gy-4">

          <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="100">
            <div>
              <h4 class="title">Teleport</h4>
              <p class="description">Jump to any place of interest with precision. Simply input your destination, and be transported there virtually, saving time and exploring effortlessly.</p>
            </div>
          </div>
          <!-- End Service Item -->

          <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="200">
            <div>
              <h4 class="title">Set Routes</h4>
              <p class="description">Chart out clear and precise routes to any destination. Perfect for efficient navigation and ensuring you never lose your way.</p>
            </div>
          </div><!-- End Service Item -->

          <div class="col-lg-4 col-md-6 service-item d-flex" data-aos="fade-up" data-aos-delay="300">
            <div>
              <h4 class="title">Chat</h4>
              <p class="description">Engage with intelligent assistant Gemini to discover key locations, ask questions, and receive instant, detailed insights about your surroundings.

</p>
            </div>
          </div><!-- End Service Item -->
          <div class="col-lg-4 col-md-6 service-item d-flex mx-auto" data-aos="fade-up" data-aos-delay="300">
            <div>
              <h4 class="title">Controls</h4>
              <p class="description">Master the map experience with intuitive controls:

               <ul class="list-group">
  <li class="list-group-item">
    <strong>W, A, S, D:</strong> Move your character across the map.
  </li>
  <li class="list-group-item">
    <strong>Mouse Movement:</strong> Adjust the camera view to explore your surroundings.
  </li>
  <li class="list-group-item">
    <strong>Control Key:</strong> Lock and unlock the camera for focused navigation.
  </li>
  <li class="list-group-item">
    <strong>Arrow Keys:</strong> Alternative movement for seamless exploration.
  </li>
</ul>


</p>
            </div>
          </div><!-- End Service Item -->

        </div>

      </div>

    </section><!-- /Featured Services Section -->

    <!-- About Section -->
    <section id="about" class="about section">

      <div class="container">

      <div class="row gy-4 justify-content-between">
      <div class="place-autocomplete-card form-label" id="place-autocomplete-card">
      <p class="form-label">Search for a place here:</p>
      </div>
      
      <div id="controls">
      <input class="form-control" type="text" id="destination-input" placeholder="Type your destination">
      <button class="btn btn-primary" id="calculate-route">Route</button>
      <button class="btn btn-danger" id="clear-route">Clear</button>
      </div>
      <div id="map-container" class="col-lg-12 position-relative align-self-start order-lg-last order-first " data-aos="fade-up" data-aos-delay="200">
      <img src="assets/img/image.png" class="img-fluid" alt="" style="height: 800px; width: 100%;">
      <span class="pulsating-play-btn"></span>
      </div>
      
      
      
      </div>
      <div id="gemini" class="mx-auto d-flex flex-column gap-5">
      <div class="speech-bubble alert alert-dismissible fade show" role="alert" id="speech-bubble">
          <span id="message-text"></span>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
                  <div class="d-flex gap-3">
                    <textarea placeholder="Ask to Gemini" class="gemini-input form-control" id="gemini-input"></textarea>
                  <button id="gemini-button" class="btn btn-primary">Send</button>
                  </div>
              </div>
      </div>

    </section><!-- /About Section -->
    
  </main>

  <footer id="footer" class="footer dark-background">

    <div class="container footer-top ">
      <div class="row gy-4 justify-content-center">
        <div class="col-lg-5 col-md-12 footer-about">
          <a href="index.html" class="logo d-flex align-items-center">
            <span class="sitename">MapSphere</span>
          </a>
          <p>MapSphere © 2024 | Empowering Your Journey with Precision and Ease.
Your partner in seamless navigation and real-world connections./p>
          
        </div>

        
      </div>
    </div>

    <div class="container copyright text-center mt-4">
      <p>© <span>Copyright</span> <strong class="px-1 sitename">MapSphere</strong> <span>All Rights Reserved</span></p>
      <div class="credits">
        <!-- All the links in the footer should remain intact. -->
        <!-- You can delete the links only if you've purchased the pro version. -->
        <!-- Licensing information: https://bootstrapmade.com/license/ -->
        <!-- Purchase the pro version with working PHP/AJAX contact form: [buy-url] -->
      </div>
    </div>

  </footer>

  <!-- Scroll Top -->

  <!-- Preloader -->
    
    
    
    `

    const playButton = document.querySelector('.pulsating-play-btn'); 

    playButton.addEventListener('click', () => {
        setTimeout(() => {
            const overlayContainer = document.querySelector('#map-container'); 
    

            overlayContainer.innerHTML = '';
    
            const mapProjectHTML = `
                    <div id="map" "></div>
              
              <div id="minimap" style="position: absolute; bottom: 20px; right: 20px; width: 300px; height: 200px; z-index: 1000; border: 2px solid black;"></div>
              
            `;
    
            overlayContainer.innerHTML = mapProjectHTML;
    
            initProject();
        }, 100)
    });
});