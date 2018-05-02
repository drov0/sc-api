-- phpMyAdmin SQL Dump
-- version 4.7.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: May 02, 2018 at 02:52 AM
-- Server version: 5.7.22-0ubuntu0.17.10.1
-- PHP Version: 7.1.15-0ubuntu0.17.10.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sc-api`
--

-- --------------------------------------------------------

--
-- Table structure for table `blacklist`
--

CREATE TABLE `blacklist` (
  `name` char(16) NOT NULL,
  `_group` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `added_by` char(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `low_quality`
--

CREATE TABLE `low_quality` (
  `name` char(16) NOT NULL,
  `_group` int(11) NOT NULL,
  `category` int(11) NOT NULL,
  `added_by` char(16) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `_group`
--

CREATE TABLE `_group` (
  `id` int(11) NOT NULL,
  `name` tinytext NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blacklist`
--
ALTER TABLE `blacklist`
  ADD PRIMARY KEY (`name`),
  ADD KEY `_group` (`_group`);

--
-- Indexes for table `low_quality`
--
ALTER TABLE `low_quality`
  ADD PRIMARY KEY (`name`),
  ADD KEY `_group` (`_group`);

--
-- Indexes for table `_group`
--
ALTER TABLE `_group`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `_group`
--
ALTER TABLE `_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blacklist`
--
ALTER TABLE `blacklist`
  ADD CONSTRAINT `blacklist_ibfk_1` FOREIGN KEY (`_group`) REFERENCES `_group` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `low_quality`
--
ALTER TABLE `low_quality`
  ADD CONSTRAINT `low_quality_ibfk_1` FOREIGN KEY (`_group`) REFERENCES `_group` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;