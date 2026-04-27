
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";

const DEFAULT_AUTHOR_ID = 73855012;

// Read query params (?author=)
function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Author = () => {
  const query = useQuery();

  // Initial author id (used only to fetch)
  const initialAuthorId = query.get("author") || String(DEFAULT_AUTHOR_ID);

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${initialAuthorId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);

  // Follow UI state
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Prevent StrictMode double-click issue
  const followClickLockRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchAuthor() {
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
          setFollowersCount(0);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAuthor();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [API_URL]);

  // ✅ Correct follow toggle (no double increment)
  const onToggleFollow = (e) => {
    e.preventDefault();
    e.stopPropagation();

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
    if (!author?.address) return;
    await navigator.clipboard.writeText(author.address);
  };

  // ✅ All UI values come DIRECTLY from API
  const authorId = author?.authorId;
  const authorName = author?.authorName || (loading ? "Loading..." : "Unknown Author");
  const tag = author?.tag ? `@${author.tag}` : "";
  const address = author?.address || "";
  const authorImage = author?.authorImage || AuthorImageFallback;

  // ✅ Author link ALWAYS uses API authorId
  const authorLink = authorId ? `/author/${authorId}` : "#";

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

            <div className="d_profile de-flex">
              <div className="de-flex-col">
                <div className="profile_avatar">
                  <Link to={authorLink}>
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
                      <Link to={authorLink}>{authorName}</Link>
                      {tag && <span className="profile_username">{tag}</span>}
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
                    {loading ? "Loading..." : `${followersCount} followers`}
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

            <div className="de_tab tab_simple">
              <AuthorItems />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;

