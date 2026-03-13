package de.portalcore.repository;

import de.portalcore.entity.NachrichtAnhang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NachrichtAnhangRepository extends JpaRepository<NachrichtAnhang, String> {

    List<NachrichtAnhang> findByNachrichtId(String nachrichtId);
}
