
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImageFallback from "../images/author_thumbnail.jpg";

const DEFAULT_AUTHOR_ID = 73855012;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Author = () => {
  const query = useQuery();

  // If you also support /author/:authorId, AuthorItems or Author route params can be added later.
  // For now, this reads from query as you previously had:
  const authorId = query.get("author") || String(DEFAULT_AUTHOR_ID);

  const API_URL = `https://us-central1-nft-cloud-functions.cloudfunctions.net/authors?author=${authorId}`;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [author, setAuthor] = useState(null);

  // Follow UI state
  const [isFollowed, setIsFollowed] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Prevent dev-mode/StrictMode double-trigger issues
  const followClickLockRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchAuthor = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(API_URL, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        if (isMounted) {
          setAuthor(data && typeof data === "object" ? data : null);

          const baseFollowers = Number(data?.followers ?? 0) || 0;
          setFollowersCount(baseFollowers);
          setIsFollowed(false);
        }
      } catch (err) {
        if (isMounted && err?.name !== "AbortError") {
          console.error(err);
          setError(err?.message || "Failed to load author.");
          setAuthor(null);
          setFollowersCount(0);
          setIsFollowed(false);
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
  }, [API_URL]);

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
    const address = author?.address;
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const authorName =
    author?.authorName || (loading ? "Loading..." : "Unknown Author");
  const tag = author?.tag ? `@${author.tag}` : "";
  const address = author?.address || "";
  const authorImage = author?.authorImage || AuthorImageFallback;

  // ✅ THIS is the ONLY allowed author link per your request:
  const authorLink = `/author/${author?.authorId ?? authorId}`;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          data-bgimage="url(images/author_banner.jpg) top"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            {/* Error message */}
            {error && !loading ? (
              <div className="row">
                <div className="col-md-12">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      {/* ✅ Avatar links to /author/${authorId} */}
                      <Link to={authorLink} title="View author">
                        <img
                          src={authorImage}
                          alt={authorName}
                          onError={(e) => {
                            e.currentTarget.src = AuthorImageFallback;
                          }}
                        />
                        <i className="fa fa-check"></i>
                      </Link>

                      <div className="profile_name">
                        <h4>
                          {/* ✅ Name links to /author/${authorId} */}
                          <Link to={authorLink} style={{ textDecoration: "none" }}>
                            {authorName}
                          </Link>

                          {tag ? (
                            <span className="profile_username">
                              {/* ✅ Username links to /author/${authorId} */}
                              <Link to={authorLink} style={{ textDecoration: "none" }}>
                                {tag}
                              </Link>
                            </span>
                          ) : null}

                          {address ? (
                            <span id="wallet" className="profile_wallet">
                              {address}
                            </span>
                          ) : null}

                          <button id="btn_copy" title="Copy Text" onClick={onCopy}>
                            Copy
                          </button>
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Follow panel (top-right) */}
                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      <div className="profile_follower">
                        {loading ? "Loading..." : `${followersCount} followers`}
                      </div>

                      <button
                        type="button"
                        className="btn-main"
                        onClick={onToggleFollow}
                        style={{ border: "none" }}
                      >
                        {isFollowed ? "Following" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs / AuthorItems */}
              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  <AuthorItems />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;
