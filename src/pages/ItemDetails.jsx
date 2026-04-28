
import React, { useEffect, useMemo, useState } from "react";
import EthImage from "../images/ethereum.svg";
import { Link, useLocation } from "react-router-dom";
import AuthorImageFallback from "../images/author_thumbnail.jpg";
import nftImageFallback from "../images/nftImage.jpg";

// ---------- helpers ----------
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function pickFirst(obj, keys, fallback) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

function formatNumber(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString();
}

function formatEth(n) {
  const num = Number(n);
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function Skeleton({ className = "", style = {} }) {
  return <div className={`skel ${className}`} style={style} />;
}

const ItemDetails = () => {
  const query = useQuery();

  // dynamic from URL: /item-details?nftId=17914494
  const nftId = query.get("nftId") || "17914494"; // fallback so page still works

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError("");
        setItem(null);

        const url = `https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails?nftId=${encodeURIComponent(
          nftId
        )}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);

        const data = await res.json();
        setItem(data);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError(e?.message || "Failed to load item details.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [nftId]);

  const onRetry = () => {
    // re-fetch without changing the URL
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setItem(null);

    const url = `https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails?nftId=${encodeURIComponent(
      nftId
    )}`;

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => setItem(data))
      .catch((e) => {
        if (e?.name !== "AbortError") setError(e?.message || "Failed to load item details.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  };

  // Map API response -> UI (safe fallbacks since API field names can vary)
  const title = pickFirst(item, ["title", "name", "nftName"], `NFT #${nftId}`);
  const description = pickFirst(
    item,
    ["description", "desc", "nftDescription", "summary"],
    "No description provided."
  );

  const imageUrl = pickFirst(
    item,
    ["image", "imageUrl", "nftImage", "nftImageUrl", "img", "thumbnail"],
    nftImageFallback
  );

  const views = pickFirst(item, ["views", "viewCount"], 0);
  const likes = pickFirst(item, ["likes", "likeCount", "favs"], 0);

  const priceEth = pickFirst(item, ["price", "ethPrice", "currentPrice", "priceEth"], null);

  // Owner/Creator (try a few shapes)
  const ownerObj = pickFirst(item, ["owner", "ownerInfo"], null);
  const ownerName = pickFirst(ownerObj || item, ["ownerName", "owner_name", "username"], "Unknown Owner");
  const ownerId = pickFirst(ownerObj || item, ["ownerId", "owner_id", "authorId", "author_id"], "");
  const ownerAvatar = pickFirst(
    ownerObj || item,
    ["ownerAvatar", "ownerImage", "owner_image", "avatar", "profileImage"],
    AuthorImageFallback
  );

  const creatorObj = pickFirst(item, ["creator", "creatorInfo"], null);
  const creatorName = pickFirst(creatorObj || item, ["creatorName", "creator_name"], "Unknown Creator");
  const creatorId = pickFirst(creatorObj || item, ["creatorId", "creator_id"], "");
  const creatorAvatar = pickFirst(
    creatorObj || item,
    ["creatorAvatar", "creatorImage", "creator_image"],
    AuthorImageFallback
  );

  // If your author route is just "/author", keep it static.
  // If you later support dynamic author routes, switch to `/author/${id}`
  const authorLink = (id) => (id ? `/author?author=${id}` : "/author");

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            {/* Error banner */}
            {error ? (
              <div className="alert alert-danger" style={{ marginTop: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <strong>Couldn’t load item details.</strong>
                    <div style={{ opacity: 0.9 }}>{error}</div>
                  </div>
                  <button className="btn btn-primary" onClick={onRetry}>
                    Retry
                  </button>
                </div>
              </div>
            ) : null}

            {/* If nftId missing entirely */}
            {!query.get("nftId") ? (
              <div className="alert alert-warning" style={{ marginTop: 16 }}>
                No <code>nftId</code> provided. Try{" "}
                <code>/item-details?nftId=17914494</code>
              </div>
            ) : null}

            <div className="row">
              {/* LEFT: Image */}
              <div className="col-md-6 text-center">
                {loading ? (
                  <Skeleton className="skel-image img-rounded mb-sm-30" />
                ) : (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="img-rounded mb-sm-30"
                    onError={(e) => {
                      e.currentTarget.src = nftImageFallback;
                    }}
                  />
                )}
              </div>

              {/* RIGHT: Details */}
              <div className="col-md-6">
                <div className="item_info">
                  {loading ? (
                    <>
                      <Skeleton className="skel-line" style={{ height: 32, width: "70%", marginBottom: 14 }} />
                      <div className="item_info_counts" style={{ marginBottom: 12 }}>
                        <Skeleton className="skel-chip" style={{ width: 90, height: 22 }} />
                        <Skeleton className="skel-chip" style={{ width: 90, height: 22, marginLeft: 12 }} />
                      </div>
                      <Skeleton className="skel-line" style={{ height: 14, width: "95%", marginBottom: 8 }} />
                      <Skeleton className="skel-line" style={{ height: 14, width: "92%", marginBottom: 8 }} />
                      <Skeleton className="skel-line" style={{ height: 14, width: "80%", marginBottom: 16 }} />
                    </>
                  ) : (
                    <>
                      <h2>{title}</h2>

                      <div className="item_info_counts">
                        <div className="item_info_views">
                          <i className="fa fa-eye"></i>
                          {formatNumber(views)}
                        </div>
                        <div className="item_info_like">
                          <i className="fa fa-heart"></i>
                          {formatNumber(likes)}
                        </div>
                      </div>

                      <p>{description}</p>
                    </>
                  )}

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          {loading ? (
                            <Skeleton className="skel-avatar" />
                          ) : (
                            <Link to={authorLink(ownerId)}>
                              <img
                                src={ownerAvatar}
                                alt={ownerName}
                                onError={(e) => {
                                  e.currentTarget.src = AuthorImageFallback;
                                }}
                              />
                              <i className="fa fa-check"></i>
                            </Link>
                          )}
                        </div>

                        <div className="author_list_info">
                          {loading ? (
                            <Skeleton className="skel-line" style={{ height: 14, width: 120 }} />
                          ) : (
                            <Link to={authorLink(ownerId)}>{ownerName}</Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>{/* reserved */}</div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Creator</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          {loading ? (
                            <Skeleton className="skel-avatar" />
                          ) : (
                            <Link to={authorLink(creatorId)}>
                              <img
                                src={creatorAvatar}
                                alt={creatorName}
                                onError={(e) => {
                                  e.currentTarget.src = AuthorImageFallback;
                                }}
                              />
                              <i className="fa fa-check"></i>
                            </Link>
                          )}
                        </div>

                        <div className="author_list_info">
                          {loading ? (
                            <Skeleton className="skel-line" style={{ height: 14, width: 120 }} />
                          ) : (
                            <Link to={authorLink(creatorId)}>{creatorName}</Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="spacer-40"></div>

                    <h6>Price</h6>
                    {loading ? (
                      <Skeleton className="skel-line" style={{ height: 22, width: 120 }} />
                    ) : (
                      <div className="nft-item-price">
                        <img
                          src={EthImage}
                          alt="ETH"
                          style={{ width: 16, height: 16, marginRight: 6, verticalAlign: "middle" }}
                          onError={(e) => {
                            // optional: hide icon if it fails
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span>{priceEth == null ? "—" : formatEth(priceEth)}</span>
                      </div>
                    )}
                  </div>

                  {/* Optional: debug the API response shape */}
                  {/* {!loading && item ? (
                    <pre style={{ marginTop: 18, background: "#111", color: "#0f0", padding: 12, borderRadius: 8 }}>
                      {JSON.stringify(item, null, 2)}
                    </pre>
                  ) : null} */}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
