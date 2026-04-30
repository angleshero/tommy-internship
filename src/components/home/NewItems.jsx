import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import axios from "axios";
import Skeleton from "../UI/Skeleton";
// import Item from "../Item";
import AOS from "aos";

const NewItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCurrentSlide, setNewCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    initial: 0,
    slides: {
      origin: "left",
      perView: 4,
      spacing: 10,
    },
    slideChanged(slider) {
      window.requestAnimationFrame(() => {
        setNewCurrentSlide(slider.track.details.rel);
      });
    },
    created() {
      setLoaded(true);
    },
    breakpoints: {
      "(min-width: 150px)": {
        slides: { perView: 1 },
      },
      "(min-width: 768px)": {
        slides: { perView: 2, spacing: 15 },
      },
      "(min-width: 992px)": {
        slides: { perView: 4, spacing: 5 },
      },
      "(min-width: 1200px)": {
        slides: { perView: 4, spacing: 10 },
      },
    },
  });

  const fetchNewItems = async () => {
    const { data } = await axios.get(
      `https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems`
    );
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNewItems().then(() => {
      AOS.refresh();
    });
  }, []);

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.update();
    }
  }, [items]);
  useEffect(() => {
    if (!sliderRef.current || !instanceRef.current) return;

    const handleUpdate = () => {
      if (instanceRef.current) instanceRef.current.update();
    };

    const imgs = sliderRef.current.querySelectorAll("img");

    imgs.forEach((img) => {
      if (img.complete) {
        handleUpdate();
      } else {
        img.addEventListener("load", handleUpdate);
      }
    });
    window.addEventListener("resize", handleUpdate);

    return () => {
      imgs.forEach((img) => img.removeEventListener("load", handleUpdate));
      window.removeEventListener("resize", handleUpdate);
    };
  }, [loaded, items]);

  const handlePrev = useCallback(() => {
    instanceRef.current?.prev();
  }, [instanceRef]);

  const handleNext = useCallback(() => {
    instanceRef.current?.next();
  }, [instanceRef]);

  const Arrow = React.memo(function Arrow({ left, onClick }) {
    return (
      <button
        className={`arrow ${left ? "arrow-left" : "arrow-right"}`}
        onClick={onClick}
        aria-label={left ? "Previous slide" : "Next slide"}
      >
        {left ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M16.67 0l2.83 2.829-9.34 9.175 9.34 9.167-2.83 2.829L4.5 12z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M7.33 24l-2.83-2.829 9.34-9.175-9.34-9.167L7.33 0l12.17 12z" />
          </svg>
        )}
      </button>
    );
  });

  // Ensure at least 4 items are displayed by padding with repeats if needed
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length >= 4) return items;
    const padded = [...items];
    for (let i = 0; padded.length < 4; i++) {
      padded.push(items[i % items.length]);
    }
    return padded;
  }, [items]);

  return (
    <section id="section-new-items" className="no-bottom">
      <div className="container">
        <div data-aos="fadeIn" className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2 data-aos="fadeIn">New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="navigation-wrapper">
            <div ref={sliderRef} className="keen-slider">
              {loading
                ? new Array(4).fill(0).map((_, index) => (
                  <div className="keen-slider__slide" key={index}>
                    <Skeleton width="100%" height="350px" />
                  </div>
                ))
                : displayItems.map((item, index) => (
                  <div className="keen-slider__slide" key={`${item.id}-${item.title}-${item.authorId || ""}-${item.nftId || ""}`}>
                    {/* <Item {...item} /> */}
                    <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={index}>
                      <div className="nft__item">
                        <div className="author_list_pp">
                          <Link
                            to="/author"
                            data-bs-toggle="tooltip"
                            data-bs-placement="top"
                            title={`Creator: ${item.authorName}`}
                          >
                            <img className="lazy" src={item.authorImage} alt="" />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="de_countdown">{item.expiryDate}</div>

                        <div className="nft__item_wrap">
                          <div className="nft__item_extra">
                            <div className="nft__item_buttons">
                              <button>Buy Now</button>
                              <div className="nft__item_share">
                                <h4>Share</h4>
                                <a href="" target="_blank" rel="noreferrer">
                                  <i className="fa fa-facebook fa-lg"></i>
                                </a>
                                <a href="" target="_blank" rel="noreferrer">
                                  <i className="fa fa-twitter fa-lg"></i>
                                </a>
                                <a href="">
                                  <i className="fa fa-envelope fa-lg"></i>
                                </a>
                              </div>
                            </div>
                          </div>

                          <Link to={`/item-details/${index}`}>
                            <img
                              src={item.nftImage}
                              className="lazy nft__item_preview"
                              alt=""
                            />
                          </Link>
                        </div>
                        <div className="nft__item_info">
                          <Link to={`/item-details/${index}`}>
                            <h4>{item.title}</h4>
                          </Link>
                          <div className="nft__item_price">3.08 ETH</div>
                          <div className="nft__item_like">
                            <i className="fa fa-heart"></i>
                            <span>69</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Arrows */}
            {loaded && instanceRef.current && (
              <>
                <Arrow left onClick={handlePrev} />
                <Arrow onClick={handleNext} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(NewItems);

// import React from "react";
// import { Link } from "react-router-dom";
// import AuthorImage from "../../images/author_thumbnail.jpg";
// import nftImage from "../../images/nftImage.jpg";

// const NewItems = () => {
//   return (
//     <section id="section-items" className="no-bottom">
//       <div className="container">
//         <div className="row">
//           <div className="col-lg-12">
//             <div className="text-center">
//               <h2>New Items</h2>
//               <div className="small-border bg-color-2"></div>
//             </div>
//           </div>
//           {new Array(4).fill(0).map((_, index) => (
//             <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={index}>
//               <div className="nft__item">
//                 <div className="author_list_pp">
//                   <Link
//                     to="/author"
//                     data-bs-toggle="tooltip"
//                     data-bs-placement="top"
//                     title="Creator: Monica Lucas"
//                   >
//                     <img className="lazy" src={AuthorImage} alt="" />
//                     <i className="fa fa-check"></i>
//                   </Link>
//                 </div>
//                 <div className="de_countdown">5h 30m 32s</div>

//                 <div className="nft__item_wrap">
//                   <div className="nft__item_extra">
//                     <div className="nft__item_buttons">
//                       <button>Buy Now</button>
//                       <div className="nft__item_share">
//                         <h4>Share</h4>
//                         <a href="" target="_blank" rel="noreferrer">
//                           <i className="fa fa-facebook fa-lg"></i>
//                         </a>
//                         <a href="" target="_blank" rel="noreferrer">
//                           <i className="fa fa-twitter fa-lg"></i>
//                         </a>
//                         <a href="">
//                           <i className="fa fa-envelope fa-lg"></i>
//                         </a>
//                       </div>
//                     </div>
//                   </div>

//                   <Link to={`/item-details/${index}`}>
//                     <img
//                       src={nftImage}
//                       className="lazy nft__item_preview"
//                       alt=""
//                     />
//                   </Link>
//                 </div>
//                 <div className="nft__item_info">
//                   <Link to={`/item-details/${index}`}>
//                     <h4>Pinky Ocean</h4>
//                   </Link>
//                   <div className="nft__item_price">3.08 ETH</div>
//                   <div className="nft__item_like">
//                     <i className="fa fa-heart"></i>
//                     <span>69</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default NewItems;