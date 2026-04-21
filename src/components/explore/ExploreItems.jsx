
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftFallback from "../../images/nftImage.jpg";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const SKELETON_COUNT = 8;

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExplore = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }

        const data = await res.json();
        console.log("Explore API raw:", data);

        const arr =
          (Array.isArray(data) && data) ||
          data?.data ||
          data?.items ||
          data?.explore ||
          data?.exploreItems ||
          data?.nfts ||
          [];

        console.log("Explore API array length:", Array.isArray(arr) ? arr.length : 0);

        setItems(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Explore fetch error:", err);
        setError(err.message || "Failed to load explore items.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  const normalizedItems = useMemo(() => {
    return items.map((item, index) => {
      const rawPrice = item?.price ?? item?.eth ?? item?.ETH ?? "0";

      return {
        id: item?.id || item?._id || item?.tokenId || index,
        title: item?.title || item?.name || item?.nftTitle || "Untitled",
        image: item?.image || item?.imageUrl || item?.cover || item?.nftImage || nftFallback,
        likes: Number(item?.likes ?? item?.likeCount ?? 0),
        price:
          typeof rawPrice === "string"
            ? parseFloat(rawPrice.replace(/[^\d.]/g, "")) || 0
            : Number(rawPrice) || 0,
        expiry: item?.expiryDate || item?.endDate || item?.expiration || null,
      };
    });
  }, [items]);

  const sortedItems = useMemo(() => {
    const arr = [...normalizedItems];
    switch (filter) {
      case "price_low_to_high":
        return arr.sort((a, b) => a.price - b.price);
      case "price_high_to_low":
        return arr.sort((a, b) => b.price - a.price);
      case "likes_high_to_low":
        return arr.sort((a, b) => b.likes - a.likes);
      default:
        return arr;
    }
  }, [normalizedItems, filter]);

  const visibleItems = sortedItems.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const formatCountdown = (expiry) => {
    if (!expiry) return "5h 30m 32s";
    const diff = new Date(expiry) - Date.now();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      <div>
        <select
          id="filter-items"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {/* Debug */}
      <div style={{ padding: 8, fontSize: 12, opacity: 0.8 }}>
        <div><b>loading:</b> {String(loading)}</div>
        <div><b>error:</b> {error || "none"}</div>
        <div><b>items:</b> {items.length}</div>
        <div><b>visibleItems:</b> {visibleItems.length}</div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="row">
        {/* Skeleton loaders */}
        {loading &&
          new Array(SKELETON_COUNT).fill(0).map((_, idx) => (
            <div
              key={idx}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            >
              <div className="nft__item">
                <div className="skeleton skeleton-img"></div>
                <div className="nft__item_info">
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                  <div className="skeleton skeleton-text tiny"></div>
                </div>
              </div>
            </div>
          ))}

        {/* Real items */}
        {!loading &&
          !error &&
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
            >
              <div className="nft__item">
                <div className="author_list_pp">
                  <Link to="/author">
                    <img
                      src={AuthorImage}
                      alt="author"
                      onError={(e) => {
                        e.currentTarget.src = AuthorImage;
                      }}
                    />
                    <i className="fa fa-check"></i>
                  </Link>
                </div>

                <div className="de_countdown">{formatCountdown(item.expiry)}</div>

                <div className="nft__item_wrap">
                  <Link to="/item-details">
                    <img
                      src={item.image}
                      className="lazy nft__item_preview"
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = nftFallback;
                      }}
                    />
                  </Link>
                </div>

                <div className="nft__item_info">
                  <Link to="/item-details">
                    <h4>{item.title}</h4>
                  </Link>

                  <div className="nft__item_price">
                    {item.price.toFixed(2)} ETH
                  </div>

                  <div className="nft__item_like">
                    <i className="fa fa-heart"></i>
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {!loading && !error && (
        <div className="row">
          <div className="col-md-12 text-center">
            {visibleCount < sortedItems.length && (
              <button
                id="loadmore"
                className="btn-main lead"
                type="button"
                onClick={handleLoadMore}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p>No items returned from API.</p>
      )}
    </>
  );
};

export default ExploreItems;
