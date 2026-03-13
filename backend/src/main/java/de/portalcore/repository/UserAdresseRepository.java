package de.portalcore.repository;

import de.portalcore.entity.UserAdresse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAdresseRepository extends JpaRepository<UserAdresse, String> {

    List<UserAdresse> findByUserId(String userId);

    Optional<UserAdresse> findByUserIdAndIstHauptadresseTrue(String userId);
}
