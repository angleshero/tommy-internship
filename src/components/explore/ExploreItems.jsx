
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AuthorImage from "../../images/author_thumbnail.jpg";
import nftFallback from "../../images/nftImage.jpg";

const API_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore";

const ExploreItems = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch explore items
  useEffect(() => {
    let isMounted = true;

    const fetchExplore = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL);
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];

        if (isMounted) {
          setItems(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load explore items.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchExplore();

    return () => {
      isMounted = false;
    };
  }, []);

  // Normalize API data
  const normalizedItems = useMemo(() => {
    return items.map((item, idx) => {
      const title = item?.title || item?.name || "Untitled";

      const image =
        item?.image ||
        item?.imageUrl ||
        item?.cover ||
        nftFallback;

      const likes = Number(item?.likes ?? item?.likeCount ?? 0);

      const rawPrice = item?.price ?? item?.eth ?? item?.amount ?? "0";
      const price =
        typeof rawPrice === "string"
          ? parseFloat(rawPrice.replace(/[^\d.]/g, "")) || 0
          : Number(rawPrice) || 0;

      const expiry =
        item?.expiryDate ||
        item?.endDate ||
        item?.expiration ||
        item?.expiresAt ||
        null;

      const id = item?.id || item?._id || `${title}-${idx}`;

      return {
        id,
        title,
        image,
        likes,
        price,
        expiry,
        authorImage: item?.authorImage || AuthorImage,
      };
    });
  }, [items]);

  // Sorting
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

  // Load more logic
  const visibleItems = useMemo(() => {
    return sortedItems.slice(0, visibleCount);
  }, [sortedItems, visibleCount]);

  const handleLoadMore = (e) => {
    e.preventDefault();
    setVisibleCount((prev) => prev + 8);
  };

  // Countdown formatter
  const formatCountdown = (expiry) => {
    if (!expiry) return "—";

    const end = new Date(expiry).getTime();
    if (Number.isNaN(end)) return "—";

    const diff = end - Date.now();
    if (diff <= 0) return "Ended";

    const totalSeconds = Math.floor(diff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

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

      {loading && <p className="col-12 py-4">Loading explore items...</p>}
      {!loading && error && (
        <p className="col-12 py-4" style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      {!loading &&
        !error &&
        visibleItems.map((item) => (
          <div
            key={item.id}
            className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
          >
            <div className="nft__item">
              {/* Author */}
              <div className="author_list_pp">
                <Link to="/author">
                  <img
                    src={item.authorImage}
                    alt="Author"
                    className="lazy"
                    onError={(e) => {
                      e.currentTarget.src = AuthorImage;
                    }}
                  />
                  <i className="fa fa-check"></i>
                </Link>
              </div>

              {/* Countdown */}
              <div className="de_countdown">
                {item.expiry ? formatCountdown(item.expiry) : "5h 30m 32s"}
              </div>

              {/* NFT Image */}
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

              {/* Info */}
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

      {!loading && !error && (
        <div className="col-md-12 text-center">
          {visibleCount < sortedItems.length ? (
            <Link
              to=""
              id="loadmore"
              className="btn-main lead"
              onClick={handleLoadMore}
            >
              Load more
            </Link>
          ) : (
            <p className="mt-3">No more items to load.</p>
          )}
        </div>
      )}
    </>
  );
};

export default ExploreItems;
