
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthorFallback from "../../images/author_thumbnail.jpg";
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

  // ✅ Fetch explore items
  useEffect(() => {
    const fetchExplore = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch explore items");

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load explore items.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExplore();
  }, []);

  // ✅ Normalize API data
  const normalizedItems = useMemo(() => {
    return items.map((item, index) => ({
      id: item?.nftId ?? item?.id ?? index,
      title: item?.title || "Untitled",
      image: item?.nftImage || nftFallback,
      authorImage: item?.authorImage || AuthorFallback,
      likes: Number(item?.likes ?? 0),
      price: Number(item?.price ?? 0),
      expiry: item?.expiryDate ?? null,
    }));
  }, [items]);

  // ✅ Sorting
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
    const diff = expiry - Date.now();
    if (diff <= 0) return "Ended";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <>
      {/* Filter */}
      <div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Default</option>
          <option value="price_low_to_high">Price, Low to High</option>
          <option value="price_high_to_low">Price, High to Low</option>
          <option value="likes_high_to_low">Most liked</option>
        </select>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="row">
        {/* ✅ Loading skeletons */}
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <div
              key={idx}
              className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
              style={{ marginBottom: 24 }}
            >
              <div className="nft__item">
                <div className="skeleton skeleton-img" />
                <div className="nft__item_info">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text short" />
                  <div className="skeleton skeleton-text tiny" />
                </div>
              </div>
            </div>
          ))}

        {/* ✅ Render items */}
        {!loading &&
          !error &&
          visibleItems.map((item) => (
            <div
              key={item.id}
              className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
              style={{ marginBottom: 24 }}
            >
              <div className="nft__item">
                {/* Author */}
                <div className="author_list_pp">
                  <Link to="/author">
                    <img
                      src={item.authorImage}
                      alt="author"
                      onError={(e) =>
                        (e.currentTarget.src = AuthorFallback)
                      }
                    />
                    <i className="fa fa-check" />
                  </Link>
                </div>

                {/* Countdown */}
                <div className="de_countdown">
                  {formatCountdown(item.expiry)}
                </div>

                {/* NFT image */}
                <div className="nft__item_wrap">
                  <Link to={`/item-details/${item.id}`}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="nft__item_preview"
                      loading="lazy"
                      onError={(e) =>
                        (e.currentTarget.src = nftFallback)
                      }
                    />
                  </Link>
                </div>

                {/* Info */}
                <div className="nft__item_info">
                  <Link to={`/item-details/${item.id}`}>
                    <h4>{item.title}</h4>
                  </Link>

                  <div className="nft__item_price">
                    {item.price.toFixed(2)} ETH
                  </div>

                  <div className="nft__item_like">
                    <i className="fa fa-heart" />
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* ✅ Load more */}
      {!loading && !error && visibleCount < sortedItems.length && (
        <div className="row">
          <div className="col-md-12 text-center">
            <button
              className="btn-main lead"
              type="button"
              onClick={handleLoadMore}
            >
              Load more
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ExploreItems;
