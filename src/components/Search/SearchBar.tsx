// ===========================================
// SEARCH BAR COMPONENT
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { Input, AutoComplete, Tag, Spin } from 'antd';
import { SearchOutlined, CloseCircleOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../services/api';
import { colors, spacing } from '../../styles/tokens';

interface SearchBarProps {
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
  showPopularSearches?: boolean;
}

interface SearchSuggestion {
  type: 'creator' | 'post' | 'user' | 'hashtag';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search creators, posts, hashtags...',
  size = 'large',
  onSearch,
  autoFocus = false,
  showRecentSearches = true,
  showPopularSearches = true,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const recent = getRecentSearches();
    setRecentSearches(recent);

    // Load popular searches
    if (showPopularSearches) {
      fetchPopularSearches();
    }
  }, []);

  useEffect(() => {
    // Debounced autocomplete search
    if (searchValue.trim().length >= 2) {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        fetchSuggestions(searchValue);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchValue]);

  const fetchSuggestions = async (query: string) => {
    try {
      setLoading(true);
      const response = await searchApi.autocomplete(query, 10);
      setSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularSearches = async () => {
    try {
      const response = await searchApi.getPopularSearches(5);
      setPopularSearches(response.data.data.popular || []);
    } catch (error) {
      console.error('Failed to fetch popular searches:', error);
    }
  };

  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    // Save to recent searches
    saveRecentSearch(trimmedValue);

    // Update local state
    setRecentSearches(getRecentSearches());

    // Navigate to search results
    if (onSearch) {
      onSearch(trimmedValue);
    } else {
      navigate(`/search?q=${encodeURIComponent(trimmedValue)}`);
    }

    // Clear input and suggestions
    setSearchValue('');
    setSuggestions([]);
    setFocused(false);
  };

  const handleSelectSuggestion = (value: string, option: any) => {
    const suggestion = suggestions.find(s => s.id === option.key);
    if (suggestion) {
      saveRecentSearch(suggestion.title);
      navigate(suggestion.url);
      setSearchValue('');
      setSuggestions([]);
      setFocused(false);
    } else {
      handleSearch(value);
    }
  };

  const removeRecentSearch = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(q => q !== query);
    localStorage.setItem('search_history', JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const getRecentSearches = (): string[] => {
    try {
      const stored = localStorage.getItem('search_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveRecentSearch = (query: string) => {
    const recent = getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    filtered.unshift(query);
    const limited = filtered.slice(0, 10);
    localStorage.setItem('search_history', JSON.stringify(limited));
  };

  // Render autocomplete options
  const renderOptions = () => {
    const options: any[] = [];

    // Show suggestions if searching
    if (searchValue.trim().length >= 2 && suggestions.length > 0) {
      options.push({
        label: (
          <div style={{ padding: spacing[2], fontWeight: 600, color: colors.gray[500] }}>
            Suggestions
          </div>
        ),
        options: suggestions.map(suggestion => ({
          key: suggestion.id,
          value: suggestion.title,
          label: (
            <div style={{ display: 'flex', gap: spacing[2], padding: spacing[2], alignItems: 'center' }}>
              {suggestion.image && (
                <img
                  src={suggestion.image}
                  alt={suggestion.title}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{suggestion.title}</div>
                {suggestion.subtitle && (
                  <div style={{ fontSize: '12px', color: colors.gray[500] }}>
                    {suggestion.subtitle}
                  </div>
                )}
              </div>
              <Tag color={getTypeColor(suggestion.type)}>{suggestion.type}</Tag>
            </div>
          ),
        })),
      });
    }

    // Show recent searches when focused and no search value
    if (focused && !searchValue && showRecentSearches && recentSearches.length > 0) {
      options.push({
        label: (
          <div style={{ padding: spacing[2], fontWeight: 600, color: colors.gray[500], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <ClockCircleOutlined /> Recent Searches
          </div>
        ),
        options: recentSearches.slice(0, 5).map((query, index) => ({
          key: `recent-${index}`,
          value: query,
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: spacing[2] }}>
              <span>{query}</span>
              <CloseCircleOutlined
                onClick={(e) => removeRecentSearch(query, e)}
                style={{ color: colors.gray[400], cursor: 'pointer' }}
              />
            </div>
          ),
        })),
      });
    }

    // Show popular searches
    if (focused && !searchValue && showPopularSearches && popularSearches.length > 0) {
      options.push({
        label: (
          <div style={{ padding: spacing[2], fontWeight: 600, color: colors.gray[500], display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <FireOutlined /> Popular Searches
          </div>
        ),
        options: popularSearches.map((query, index) => ({
          key: `popular-${index}`,
          value: query,
          label: <div style={{ padding: spacing[2] }}>{query}</div>,
        })),
      });
    }

    return options;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'creator': return 'blue';
      case 'post': return 'green';
      case 'user': return 'purple';
      case 'hashtag': return 'orange';
      default: return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ width: '100%' }}
    >
      <AutoComplete
        value={searchValue}
        onChange={setSearchValue}
        onSelect={handleSelectSuggestion}
        options={renderOptions()}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
        style={{ width: '100%' }}
        dropdownStyle={{ maxHeight: '400px', overflow: 'auto' }}
      >
        <Input
          size={size}
          placeholder={placeholder}
          prefix={loading ? <Spin size="small" /> : <SearchOutlined style={{ color: colors.gray[400] }} />}
          suffix={
            searchValue && (
              <CloseCircleOutlined
                onClick={() => {
                  setSearchValue('');
                  setSuggestions([]);
                }}
                style={{ color: colors.gray[400], cursor: 'pointer' }}
              />
            )
          }
          onPressEnter={() => handleSearch(searchValue)}
          autoFocus={autoFocus}
          style={{
            borderRadius: '24px',
            paddingLeft: spacing[4],
            paddingRight: spacing[4],
          }}
        />
      </AutoComplete>
    </motion.div>
  );
};

export default SearchBar;
