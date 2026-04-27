
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import AuthorImageFallback from "../../images/author_thumbnail.jpg";
import nftImageFallback from "../../images/nftImage.jpg";

// If your route param is different, change this in your route OR here.
const DEFAULT_AUTHOR_ID = 73855012;

const AuthorItems = () => {
  const navigate = useNavigate();
  const params = useParams();

  // Expecting /author/:authorId
  const authorIdFromUrl = params?.authorId;
  const authorId = authorIdFromUrl || String(DEFAULT_AUTHOR_ID);

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [author, setAuthor] = useState(null);
  const [nfts, setNfts] = useState([]);

  // Follow button state (single, top-right)
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const skeletonCards = useMemo(() => new Array(8).fill(0), []);

  // Fetch author + nftCollection whenever authorId changes in URL
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`API request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Author object
        setAuthor(data && typeof data === "object" ? data : null);

        // NFTs
        const collection = Array.isArray(data?.nftCollection) ? data.nftCollection : [];
        setNfts(collection);

        // Seed follow data ONCE per author id
        const baseFollowers = Number(data?.followers ?? 0) || 0;
        setFollowersCount(baseFollowers);
        setIsFollowed(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setErrorMsg("Could not load author NFTs. Please try again.");

          // Safe fallbacks so the UI doesn't crash
          setAuthor({
            authorId,
            authorName: "Unknown Author",
            authorImage: AuthorImageFallback,
            followers: 0,
          });
          setNfts([]);
          setFollowersCount(0);
          setIsFollowed(false);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [API_URL, authorId]);

  // Follow toggles +1 then -1 (never below 0)
  const handleFollowToggle = () => {
    setIsFollowed((prev) => {
      setFollowersCount((count) => (prev ? Math.max(0, count - 1) : count + 1));
      return !prev;
    });
  };

  // Click author icon: ensure URL hits /author/<authorId>
  const handleAuthorClick = (e) => {
    e.preventDefault();
    navigate(`/author/${author?.authorId ?? authorId}`);
  };

  // Derived display fields
  const authorName = author?.authorName || "Author";
  const authorAvatar = author?.authorImage || AuthorImageFallback;

  return (
    <div className="de_tab_content">
      {/* ======= Author Header (single Follow button at top-right) ======= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "18px 0 24px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src={authorAvatar}
            alt={authorName}
            onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div>
            <h3 style={{ margin: 0 }}>{authorName}</h3>
            {author?.tag ? (
              <div style={{ color: "#7a6ff0", fontWeight: 600, marginTop: 4 }}>
                @{author.tag}
              </div>
            ) : null}
            {author?.address ? (
              <div style={{ opacity: 0.7, marginTop: 6, fontSize: 14 }}>
                {String(author.address).slice(0, 16)}...
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontWeight: 600, opacity: 0.75 }}>
            {followersCount} followers
          </div>

          <button
            type="button"
            onClick={handleFollowToggle}
            className="btn-main"
            style={{
              padding: "10px 26px",
              borderRadius: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isFollowed ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Error message (non-blocking) */}
      {!loading && errorMsg ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255, 165, 0, 0.12)",
            color: "#b26a00",
            marginBottom: 12,
            fontSize: 14,
          }}
        >
          {errorMsg}
        </div>
      ) : null}

      {/* ======= NFT Grid ======= */}
      <div className="tab-1">
        <div className="row">
          {/* Skeletons */}
          {loading ? (
            skeletonCards.map((_, i) => (
              <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={`sk-${i}`}>
                <div className="nft__item">
                  <div className="author_list_pp" style={{ marginBottom: 10 }}>
                    <div className="skeleton skeleton-circle-sm" />
                  </div>

                  <div className="skeleton skeleton-rect" />

                  <div style={{ marginTop: 12 }}>
                    <div className="skeleton skeleton-line" style={{ width: "78%" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      <div className="skeleton skeleton-line" style={{ width: "35%" }} />
                      <div className="skeleton skeleton-line" style={{ width: "25%" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : nfts.length === 0 ? (
            <div className="col-12" style={{ padding: "30px 0", opacity: 0.7 }}>
              No NFTs found for this author.
            </div>
          ) : (
            nfts.map((nft, index) => {
              const key = nft?.nftId ?? nft?.id ?? index;
              const nftImage = nft?.nftImage || nftImageFallback;
              const title = nft?.title || "Untitled";
              const price = nft?.price ?? "—";
              const likes = nft?.likes ?? 0;

              return (
                <div className="col-lg-3 col-md-6 col-sm-6 col-xs-12" key={key}>
                  <div className="nft__item">
                    {/* ✅ Author icon on EACH element */}
                    <div className="author_list_pp" style={{ marginBottom: 10 }}>
                      {/* "Hit the author id in the URL" on click */}
                      <a href={`/author/${author?.authorId ?? authorId}`} onClick={handleAuthorClick}>
                        <img
                          className="lazy"
                          src={authorAvatar}
                          alt={authorName}
                          onError={(e) => (e.currentTarget.src = AuthorImageFallback)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <i className="fa fa-check"></i>
                      </a>
                    </div>

                    <div className="nft__item_wrap">
                      {/* If your app uses /item-details without params, change this link */}
                      <Link to={`/item-details/${nft?.nftId ?? ""}`}>
                        <img
                          src={nftImage}
                          className="lazy nft__item_preview"
                          alt={title}
                          onError={(e) => (e.currentTarget.src = nftImageFallback)}
                        />
                      </Link>
                    </div>

                    <div className="nft__item_info">
                      <Link to={`/item-details/${nft?.nftId ?? ""}`}>
                        <h4>{title}</h4>
                      </Link>

                      <div className="nft__item_price">{`${price} ETH`}</div>

                      <div className="nft__item_like">
                        <i className="fa fa-heart"></i>
                        <span>{likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      
    </div>
  );
};

export default AuthorItems;

