
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";

const Author = () => {
  // ✅ Source of truth comes from the route
  const { authorId } = useParams();

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);

  // Follow UI state
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // ✅ Prevent React 18 StrictMode double increment
  const followClickLockRef = useRef(false);

  useEffect(() => {
    if (!authorId) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchAuthor = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();

        if (isMounted) {
          setAuthor(data);
          setFollowersCount(Number(data?.followers ?? 0));
          setIsFollowed(false);
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load author.");
          setAuthor(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAuthor();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [authorId, API_URL]);

  // ✅ Follow toggle (safe in dev + prod)
  const onToggleFollow = () => {
    if (followClickLockRef.current) return;
    followClickLockRef.current = true;

    setIsFollowed((prev) => {
      setFollowersCount((count) =>
        prev ? Math.max(0, count - 1) : count + 1
      );
      return !prev;
    });

    setTimeout(() => {
      followClickLockRef.current = false;
    }, 0);
  };

  const onCopy = async () => {
    if (author?.address) {
      await navigator.clipboard.writeText(author.address);
    }
  };

  // ✅ API‑driven values
  const authorName = author?.authorName || "Loading...";
  const tag = author?.tag ? `@${author.tag}` : "";
  const address = author?.address || "";
  const authorImage = author?.authorImage || AuthorImageFallback;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <section
          id="profile_banner"
          className="text-light"
          style={{ background: `url(${AuthorBanner}) top` }}
        />

        <section>
          <div className="container">
            {error && !loading && (
              <div className="alert alert-danger">{error}</div>
            )}

            {/* ✅ Skeleton vs real header */}
            {loading ? (
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                  <div className="profile_avatar">
                    <div className="skeleton-avatar" />
                    <div className="profile_name">
                      <div className="skeleton-line skeleton-name" />
                      <div className="skeleton-line skeleton-tag" />
                      <div className="skeleton-line skeleton-wallet" />
                    </div>
                  </div>
                </div>

                <div className="profile_follow de-flex">
                  <div className="de-flex-col">
                    <div className="skeleton-line skeleton-followers" />
                    <div className="skeleton-button" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                  <div className="profile_avatar">
                    <Link to={`/author/${authorId}`}>
                      <img
                        src={authorImage}
                        alt={authorName}
                        onError={(e) =>
                          (e.currentTarget.src = AuthorImageFallback)
                        }
                      />
                      <i className="fa fa-check" />
                    </Link>

                    <div className="profile_name">
                      <h4>
                        <Link to={`/author/${authorId}`}>{authorName}</Link>
                        {tag && (
                          <span className="profile_username">{tag}</span>
                        )}
                        {address && (
                          <span className="profile_wallet">{address}</span>
                        )}
                        <button id="btn_copy" onClick={onCopy}>
                          Copy
                        </button>
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="profile_follow de-flex">
                  <div className="de-flex-col">
                    <div className="profile_follower">
                      {followersCount} followers
                    </div>

                    <button
                      type="button"
                      className="btn-main"
                      onClick={onToggleFollow}
                    >
                      {isFollowed ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ NFT grid (authorId passed correctly) */}
            <div className="de_tab tab_simple">
              <AuthorItems authorId={author?.authorId} />
            </div>
          </div>
        </section>
      </div>

      {/* ✅ Skeleton CSS */}
      <style>{`
        .skeleton-avatar,
        .skeleton-line,
        .skeleton-button {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.06) 25%,
            rgba(255,255,255,0.14) 37%,
            rgba(255,255,255,0.06) 63%
          );
          background-size: 400% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
          border-radius: 10px;
        }

        .skeleton-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
        }

        .skeleton-name { width: 200px; height: 16px; margin-top: 12px; }
        .skeleton-tag { width: 120px; height: 14px; margin-top: 8px; }
        .skeleton-wallet { width: 280px; height: 14px; margin-top: 8px; }
        .skeleton-followers { width: 120px; height: 14px; }
        .skeleton-button { width: 120px; height: 40px; margin-top: 12px; }

        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }
      `}</style>
    </div>
  );
};

export default Author;
