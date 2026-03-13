package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter.AuthDetails;
import de.portalcore.entity.*;
import de.portalcore.enums.*;
import de.portalcore.service.NachrichtService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/nachricht")
public class NachrichtController {

    private final NachrichtService nachrichtService;

    public NachrichtController(NachrichtService nachrichtService) {
        this.nachrichtService = nachrichtService;
    }

    // ===== Posteingang =====

    @GetMapping("/posteingang")
    public ResponseEntity<List<NachrichtItemDto>> getPosteingang(
            @RequestParam(required = false) NachrichtTyp typ) {
        AuthDetails auth = getAuth();
        List<NachrichtItem> items;
        if (typ != null) {
            items = nachrichtService.getByTyp(auth.userId(), typ);
        } else {
            items = nachrichtService.getPosteingang(auth.userId());
        }
        return ResponseEntity.ok(items.stream().map(n -> toDto(n, auth.userId())).toList());
    }

    @GetMapping("/gesendet")
    public ResponseEntity<List<NachrichtItemDto>> getGesendet() {
        AuthDetails auth = getAuth();
        List<NachrichtItem> items = nachrichtService.getGesendet(auth.userId());
        return ResponseEntity.ok(items.stream().map(n -> toDto(n, auth.userId())).toList());
    }

    @GetMapping("/archiv")
    public ResponseEntity<List<NachrichtItemDto>> getArchiv() {
        AuthDetails auth = getAuth();
        List<NachrichtItem> items = nachrichtService.getArchiv(auth.userId());
        return ResponseEntity.ok(items.stream().map(n -> toDto(n, auth.userId())).toList());
    }

    @GetMapping("/ungelesen-anzahl")
    public ResponseEntity<Map<String, Long>> getUngelesenAnzahl() {
        AuthDetails auth = getAuth();
        long count = nachrichtService.getUngeleseneAnzahl(auth.userId());
        return ResponseEntity.ok(Map.of("anzahl", count));
    }

    // ===== Detail =====

    @GetMapping("/{id}")
    public ResponseEntity<NachrichtItemDto> getById(@PathVariable String id) {
        AuthDetails auth = getAuth();
        NachrichtItem item = nachrichtService.findById(id);
        nachrichtService.alsGelesenMarkieren(id, auth.userId());
        return ResponseEntity.ok(toDto(item, auth.userId()));
    }

    // ===== Erstellen =====

    @PostMapping
    public ResponseEntity<NachrichtItemDto> erstellen(@RequestBody ErstellenRequest request) {
        AuthDetails auth = getAuth();
        NachrichtItem item = nachrichtService.erstellen(
                auth.userId(), auth.tenantId(),
                request.typ != null ? request.typ : NachrichtTyp.NACHRICHT,
                request.betreff, request.inhalt,
                request.prioritaet, request.frist, request.erinnerungAm,
                request.empfaengerIds, false, request.referenzTyp, request.referenzId);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(item, auth.userId()));
    }

    // ===== Aktionen =====

    @PutMapping("/{id}/gelesen")
    public ResponseEntity<Void> alsGelesen(@PathVariable String id) {
        nachrichtService.alsGelesenMarkieren(id, getAuth().userId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/ungelesen")
    public ResponseEntity<Void> alsUngelesen(@PathVariable String id) {
        nachrichtService.alsUngelesenMarkieren(id, getAuth().userId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/archivieren")
    public ResponseEntity<Void> archivieren(@PathVariable String id) {
        nachrichtService.archivieren(id, getAuth().userId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/erledigt")
    public ResponseEntity<Void> alsErledigt(@PathVariable String id) {
        nachrichtService.alsErledigtMarkieren(id, getAuth().userId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/alle-gelesen")
    public ResponseEntity<Map<String, Integer>> alleAlsGelesen() {
        int count = nachrichtService.alleAlsGelesenMarkieren(getAuth().userId());
        return ResponseEntity.ok(Map.of("markiert", count));
    }

    // ===== Unteraufgaben =====

    @PostMapping("/{id}/unteraufgaben")
    public ResponseEntity<NachrichtItemDto> unteraufgabeErstellen(
            @PathVariable String id, @RequestBody UnteraufgabeRequest request) {
        AuthDetails auth = getAuth();
        NachrichtItem item = nachrichtService.unteraufgabeErstellen(
                id, auth.userId(), auth.tenantId(),
                request.betreff, request.inhalt,
                request.prioritaet, request.frist, request.empfaengerIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(item, auth.userId()));
    }

    @GetMapping("/{id}/unteraufgaben")
    public ResponseEntity<List<NachrichtItemDto>> getUnteraufgaben(@PathVariable String id) {
        AuthDetails auth = getAuth();
        List<NachrichtItem> items = nachrichtService.getUnteraufgaben(id);
        return ResponseEntity.ok(items.stream().map(n -> toDto(n, auth.userId())).toList());
    }

    // ===== Anhänge =====

    @PostMapping("/{id}/anhaenge")
    public ResponseEntity<AnhangDto> anhangHochladen(
            @PathVariable String id,
            @RequestParam("datei") MultipartFile datei) throws IOException {
        NachrichtAnhang anhang = nachrichtService.anhangHinzufuegen(
                id, datei.getOriginalFilename(), datei.getContentType(),
                datei.getSize(), datei.getBytes());
        return ResponseEntity.status(HttpStatus.CREATED).body(toAnhangDto(anhang));
    }

    @GetMapping("/anhaenge/{anhangId}")
    public ResponseEntity<byte[]> anhangHerunterladen(@PathVariable String anhangId) {
        NachrichtAnhang anhang = nachrichtService.getAnhang(anhangId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + anhang.getDateiname() + "\"")
                .contentType(MediaType.parseMediaType(
                        anhang.getDateityp() != null ? anhang.getDateityp() : "application/octet-stream"))
                .contentLength(anhang.getDateigroesse())
                .body(anhang.getDaten());
    }

    // ===== Auth Helper =====

    private AuthDetails getAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nicht authentifiziert");
    }

    // ===== DTO Mapping =====

    private NachrichtItemDto toDto(NachrichtItem item, String currentUserId) {
        NachrichtEmpfaenger empfStatus = nachrichtService.getEmpfaengerStatus(item.getId(), currentUserId);
        return new NachrichtItemDto(
                item.getId(),
                item.getTyp().name(),
                item.getBetreff(),
                item.getInhalt(),
                item.getErsteller().getId(),
                item.getErsteller().getVorname() + " " + item.getErsteller().getNachname(),
                item.getErsteller().getInitialen(),
                item.getPrioritaet().name(),
                item.getStatus().name(),
                item.getFrist(),
                item.getErinnerungAm(),
                item.getErstelltAm(),
                item.isSystemGeneriert(),
                item.getReferenzTyp(),
                item.getReferenzId(),
                item.getEmpfaenger().stream().map(e -> new EmpfaengerDto(
                        e.getEmpfaenger().getId(),
                        e.getEmpfaenger().getVorname() + " " + e.getEmpfaenger().getNachname(),
                        e.getEmpfaenger().getInitialen(),
                        e.isGelesen(), e.isArchiviert(), e.isErledigt()
                )).toList(),
                item.getAnhaenge().stream().map(this::toAnhangDto).toList(),
                empfStatus != null && empfStatus.isGelesen(),
                empfStatus != null && empfStatus.isArchiviert(),
                empfStatus != null && empfStatus.isErledigt(),
                item.getParent() != null ? item.getParent().getId() : null,
                nachrichtService.countUnteraufgaben(item.getId()),
                nachrichtService.countErledigteUnteraufgaben(item.getId())
        );
    }

    private AnhangDto toAnhangDto(NachrichtAnhang a) {
        return new AnhangDto(a.getId(), a.getDateiname(), a.getDateityp(), a.getDateigroesse(), a.getErstelltAm());
    }

    // ===== Records =====

    record ErstellenRequest(NachrichtTyp typ, String betreff, String inhalt,
                            NachrichtPrioritaet prioritaet, LocalDateTime frist,
                            LocalDateTime erinnerungAm, List<String> empfaengerIds,
                            String referenzTyp, String referenzId) {}

    record NachrichtItemDto(String id, String typ, String betreff, String inhalt,
                            String erstellerId, String erstellerName, String erstellerInitialen,
                            String prioritaet, String status, LocalDateTime frist,
                            LocalDateTime erinnerungAm, LocalDateTime erstelltAm,
                            boolean systemGeneriert, String referenzTyp, String referenzId,
                            List<EmpfaengerDto> empfaenger, List<AnhangDto> anhaenge,
                            boolean gelesen, boolean archiviert, boolean erledigt,
                            String parentId, long unteraufgabenGesamt, long unteraufgabenErledigt) {}

    record UnteraufgabeRequest(String betreff, String inhalt, NachrichtPrioritaet prioritaet,
                               LocalDateTime frist, List<String> empfaengerIds) {}

    record EmpfaengerDto(String id, String name, String initialen,
                         boolean gelesen, boolean archiviert, boolean erledigt) {}

    record AnhangDto(String id, String dateiname, String dateityp, Long dateigroesse,
                     LocalDateTime erstelltAm) {}
}
